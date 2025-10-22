---
title: "Agents"
date: "2025-01-01"
summary: ""
description: "Working with agents."
toc: false
readTime: false
autonumber: true
math: true
tags: ["llms", "agents"]
showTags: false
hideBackToTop: false
breadcrumbs: false
---
- Get agent to run docker container, access it, then run a random forest model on some data.
- Listened to a podcast once that said the biggest issue with a lot of agentic work is the lack of tools which have good interfaces for LLMs. So I should create good tools.
- Note: This is for my mac. It may work on Linux. Definitely (likely -- maybe) wont work on Windows. I don't plan to do anything with this code. So.

# Structured Output

There are better APIs, tools, etc. out there. I'm using ollama for now. I'll likely change it at a later date.

```bash
ollama 0.4.5
```

## Structured Output

Pulled directly from the [ollama-python examples](https://github.com/ollama/ollama-python/blob/main/examples/async-structured-outputs.py) repo.

```python
from pydantic import BaseModel
from ollama import AsyncClient
import asyncio


# Define the schema for the response
class FriendInfo(BaseModel):
    name: str
    age: int
    is_available: bool


class FriendList(BaseModel):
    friends: list[FriendInfo]


async def main():
    client = AsyncClient()
    response = await client.chat(
        model="llama3.1:8b",
        messages=[
            {
                "role": "user",
                "content": "I have two friends. The first is Ollama 22 years old busy saving the world, and the second is Alonso 23 years old and wants to hang out. Return a list of friends in JSON format",
            }
        ],
        format=FriendList.model_json_schema(),  # Use Pydantic to generate the schema
        options={"temperature": 0},  # Make responses more deterministic
    )

    # Use Pydantic to validate the response
    friends_response = FriendList.model_validate_json(response.message.content)
    print(friends_response)


if __name__ == "__main__":
    asyncio.run(main())
```

It does actually work:

```python
friends = [
    FriendInfo(name="Ollama", age=22, is_available=False),
    FriendInfo(name="Alonso", age=23, is_available=True),
]
```

## Building tools

I guess information density is the biggest issue with a lot of these tools. Or clarity. Not sure. But as an example, if I wanted to give our agent (I'm gonna call him Ki) the ability to list a file system. How would I do it? I guess I could use python's `os`. That's pretty strong.

### File System Tool

If I were blind (and trained on a bunch of data), I'd probably want an interface to the filesystem which would return `JSON` or XML. Something which will allow me to always see the responses, even if they're empty. XML came to mind over `JSON` because Anthropic's models love 'em (or at least one of them does).

```XML
<filesystem>
  <file>
    <name>file1</name>
    <type>txt</type>
    <size>1kb</size>
    <owner>owner</owner>
    <modified>2025-01-01</modified>
    <created>2025-01-01</created>
  </file>
</filesystem>
```

Fine, so I have a silly little function which will handle parsing the file system.
