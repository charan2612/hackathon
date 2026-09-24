import asyncio
import json
import socket

import httpx

from app.settings import settings


class AIService:
    def _configured(self):
        return bool(
            settings.llm_api_key
            and settings.llm_model
            and settings.llm_base_url
        )

    async def _call(self, system: str, user: str):
        if not self._configured():
            raise RuntimeError("AI service is not configured.")

        headers = {
            "Authorization": f"Bearer {settings.llm_api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": settings.llm_model,
            "messages": [
                {
                    "role": "system",
                    "content": system,
                },
                {
                    "role": "user",
                    "content": user,
                },
            ],
            "temperature": 0.2,
            "response_format": {
                "type": "json_object"
            },
        }

        # Prefer IPv6 because the current Windows network path
        # to api.openai.com has a working IPv6 route while IPv4
        # is timing out.
        original_getaddrinfo = socket.getaddrinfo

        def ipv6_first_getaddrinfo(*args, **kwargs):
            results = original_getaddrinfo(*args, **kwargs)

            ipv6 = [
                result
                for result in results
                if result[0] == socket.AF_INET6
            ]

            ipv4 = [
                result
                for result in results
                if result[0] == socket.AF_INET
            ]

            return ipv6 + ipv4

        transport = httpx.AsyncHTTPTransport(
            retries=1
        )

        async with httpx.AsyncClient(
            timeout=httpx.Timeout(
                connect=15.0,
                read=60.0,
                write=30.0,
                pool=15.0,
            ),
            transport=transport,
        ) as client:

            # Temporarily prefer IPv6 for this request.
            socket.getaddrinfo = ipv6_first_getaddrinfo

            try:
                response = await client.post(
                    settings.llm_base_url,
                    headers=headers,
                    json=payload,
                )
            finally:
                socket.getaddrinfo = original_getaddrinfo

            response.raise_for_status()

            data = response.json()

            content = data["choices"][0]["message"]["content"]

            return json.loads(content)

    async def review_code(
        self,
        code,
        language,
        problem,
        test_results,
        previous_errors,
    ):
        system = """
You are CodePilotX's code-review engine.

Return JSON only.

Required keys:
bugs,
logic_issues,
readability,
efficiency,
complexity,
security,
performance,
suggested_improvements,
confidence.

Each issue must contain:
what_is_wrong,
why,
impact,
suggested_improvement.

Do not silently rewrite the student's code.
Focus on helping the student understand and improve their own code.
"""

        user = json.dumps(
            {
                "language": language,
                "problem": problem,
                "code": code,
                "test_results": test_results,
                "previous_errors": previous_errors,
            }
        )

        return await self._call(system, user)

    async def hint(
        self,
        code,
        language,
        problem,
    ):
        system = """
Return JSON only with these keys:

hint,
concept,
next_step,
confidence.

Give a useful hint rather than a complete solution.
Do not provide the entire solution.
"""

        return await self._call(
            system,
            json.dumps(
                {
                    "language": language,
                    "problem": problem,
                    "code": code,
                }
            ),
        )

    async def transfer(
        self,
        concept,
        original_problem,
    ):
        system = """
Generate one transfer coding problem that tests the
same underlying concept in a different context.

Return JSON with:

title,
description,
constraints,
concept,
starter_code,
tests.
"""

        return await self._call(
            system,
            json.dumps(
                {
                    "concept": concept,
                    "original_problem": original_problem,
                }
            ),
        )

    async def ownership_questions(
        self,
        code,
        problem,
    ):
        system = """
Generate 3 personalized code-ownership questions.

Return JSON with key:

questions

questions must be an array of objects containing:

question,
expected_concept.
"""

        return await self._call(
            system,
            json.dumps(
                {
                    "code": code,
                    "problem": problem,
                }
            ),
        )


ai = AIService()