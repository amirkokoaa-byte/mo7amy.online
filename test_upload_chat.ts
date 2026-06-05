import fs from 'fs';

async function testUploadAndChat() {
  const fd = new FormData();
  fs.writeFileSync('dummy.pdf', 'dummy content');
  const blob = new Blob(['dummy content'], { type: 'application/pdf' });
  fd.append('files', blob, 'dummy.pdf');

  const uploadRes = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: fd
  });
  console.log('Upload status:', uploadRes.status);
  const uploadData = await uploadRes.json();
  console.log('Upload data:', uploadData);

  const testChatRes = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages:[{role:"user",text:"What's in the document?"}],
      documentUris: [uploadData.files[0]]
    })
  });
  console.log('Chat status:', testChatRes.status);
  const chatData = await testChatRes.text();
  console.log('Chat data:', chatData);
}

testUploadAndChat();
