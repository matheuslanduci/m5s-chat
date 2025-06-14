[x] Authentication
[x] Multiple models
[x] Instead of showing models, we'll have a "noob support" where people will
pick the category/or AI will decide the best model to go to.
[x] Enhance prompt via Gemini 2.0 flash
~~[ ] The initial input should be saved across devices
  Cancelled - it's kinda weird and across tabs usually we don't want something 
  like this because the user is usually seeking different prompts~~
[ ] Chat history
[ ] Synchronization on streaming response
  - I think Convex communicates directly with the API instead of going 
  through the client, so resume streaming is possible because the client is not
  involved in the streaming process.
  Check it out: https://www.convex.dev/components/persistent-text-streaming
[ ] Message history on retry
[ ] Chat sharing via link
[ ] Chat collaboration
  - Besides sharing, now people can collaborate
[ ] General prompt for each user
[ ] Model-specific prompts
[ ] Ability to summarize chat
  - Automatic and with a button
  - Automatic will be whenever the model reach the context length
[ ] Queue to send messages when the response is being generated
[ ] Attachment support
[ ] Command-menu support
[ ] Custom themes (inspired by IDE themes)
[ ] Full keyboard support (model selection) with react-hotkeys-hook
[ ] Billing support with Clerk Billing
[ ] Change title of the chat manually or regenerate with AI
[ ] Support Reasoning
[ ] Redesign
[x] Allow send messaging without anything but attachments
[ ] Allow BYOK

---

Pages/Blocks
[x] Sign in
[x] Sign up
[ ] Chat
[ ] Chat/ID
[ ]