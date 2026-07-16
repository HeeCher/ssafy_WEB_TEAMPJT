export const handler = async (event) => {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body.' }),
    };
  }

  const question = payload?.question?.toString().trim();
  if (!question) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Question is required.' }),
    };
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'OpenAI API key is not configured.' }),
    };
  }

  const model = process.env.OPENAI_MODEL || 'gpt-5-mini';

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for a Seoul community website. Keep answers concise and friendly.',
        },
        {
          role: 'user',
          content: question,
        },
      ],
      max_completion_tokens: 450,
    }),
  });

  if (!openaiResponse.ok) {
    const errorBody = await openaiResponse.text();
    return {
      statusCode: 502,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'OpenAI API error.', details: errorBody }),
    };
  }

  const data = await openaiResponse.json();
  const answer = data?.choices?.[0]?.message?.content?.trim() ?? '';

  return {
    statusCode: 200,
    headers: jsonHeaders,
    body: JSON.stringify({ answer }),
  };
};
