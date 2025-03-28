# Advanced Universal Recreational Activities (AURA) Relay Function

**AURA Relay Function** is an Azure Function that acts as a middle layer between the **AURA Gateway** and the **AURA Processing API**.

It is triggered by messages on **Azure Service Bus** sent from the AURA Gateway. Upon receiving a message, the function forwards the event to the AURA Processing API via an HTTPS request. The response is then sent back to the gateway through another Azure Service Bus queue.

## 🧭 Architecture Flow

```
AURA Gateway
      ⬇
Azure Service Bus (incoming queue)
      ⬇
AURA Relay Function (this project)
      ⬇
AURA Processing API (HTTPS request)
      ⬇
AURA Relay Function (this project)
      ⬇
Azure Service Bus (outgoing queue)
      ⬇
AURA Gateway → Discord
```

## ✨ Features

- Triggered by Azure Service Bus messages
- Forwards events to the AURA Processing API via HTTP POST
- Sends responses to another Azure Service Bus queue
- Logs failures and retries on transient errors

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/anthonykung/aura-function.git
cd aura-function
```

### 2. Set up environment variables

```bash
cp local.settings.example.json local.settings.json
```

Update fields in the file with your connection string.

> This file is **excluded from version control**. Keep your secrets safe.

### 3. Install dependencies

```bash
npm install
# or
yarn install
```

### 4. Run locally

> Please refer to the [Develop Azure Functions locally using Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=linux%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-typescript) for more information.

Install the Azure Functions Core Tools if you haven’t:

```bash
sudo apt-get update && sudo apt-get install azure-functions-core-tools-4
```

Then:

```bash
npm start
# or
yarn start
```

## 🛠 Deployment

> Please refer to the [Develop Azure Functions locally using Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=linux%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-typescript) for more information.

This function can be deployed to Azure using the Azure CLI or through GitHub Actions. It is recommended to use **VS Code Azure Functions extension** for a more seamless deployment process.

To deploy manually:

```bash
func azure functionapp publish <FunctionAppName>
```

Make sure the Azure environment variables match your local `local.settings.json`. This should be the App Settings not the Connection Strings.

## 💡 Notes

- 🤖 Some parts of this project were written with the help of **GitHub Copilot VS Code Extension**, so you may encounter code that's unconventional or quirky, but hey it works and it cuts down the development time 😉
- This function expects messages in a specific format matching what the AURA Gateway sends.

## 📄 License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

---

Built with ☁️ and ❤️ by [Anthony Kung](https://anth.dev).
