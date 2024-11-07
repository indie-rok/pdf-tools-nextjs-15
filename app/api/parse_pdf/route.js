import { NextResponse } from "next/server";

function generatePrompt(images) {
  return [
    {
      role: "user",
      content: [
        { type: "text", text: "What’s in this image?" },
        ...images.map((url) => ({
          type: "image_url",
          image_url: {
            url,
          },
        })),
      ],
    },
  ];
}

export async function POST(req) {
  try {
    const { images } = await req.json();

    const messages = generatePrompt(images);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPEN_AI_TOKEN}`,
      },
      body: JSON.stringify({ messages, model: "gpt-4o" }),
    });

    const data = await response.json();

    return NextResponse.json({ resume: data.choices[0].message.content });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
