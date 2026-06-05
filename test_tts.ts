import fs from 'fs';

async function testTts() {
  const testChatRes = await fetch("http://localhost:3000/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "hello world"
    })
  });
  console.log('Status:', testChatRes.status);
  const data = await testChatRes.text();
  console.log('Data:', data.substring(0, 100)); // print first 100 chars
}

testTts();
