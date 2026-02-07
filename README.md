# AlwaysHerFault



## Disclaimer: This is just a fun side-project. Do not use this for any malicious work. (The deployments is currently down :D)


## 📝 Description

The AlwaysHerFault repository, a Next.js web application that translates honest statements into manipulative communication patterns. The system demonstrates psychological manipulation tactics by rewriting user input to shift blame, gaslight, and employ other toxic communication strategies.





## Detection Request Flow

<img width="780" height="918" alt="image" src="https://github.com/user-attachments/assets/d177b81b-e828-409b-89cc-9324ac4ff0ac" />

## Middleware Header Injection
<img width="1644" height="589" alt="image" src="https://github.com/user-attachments/assets/fb0a3033-1346-44e9-8fa0-208ee11437dc" />

## Error Handling Paths

<img width="1013" height="893" alt="image" src="https://github.com/user-attachments/assets/f603113d-48ae-4a80-a89f-3eb1a547aa49" />

## 📦 Key Dependencies

```
next: ^14.0.0
react: ^18.2.0
react-dom: ^18.2.0
@google/generative-ai: ^0.21.0
```

## 🚀 Run Commands

- **dev**: `npm run dev`
- **build**: `npm run build`
- **start**: `npm run start`


## 📁 Project Structure

```
.
├── app
│   ├── api
│   │   ├── translate
│   │   │   └── route.js
│   │   └── translate-lang
│   │       └── route.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components
│   └── Translator.js
├── jsconfig.json
├── lib
│   ├── rateLimit.js
│   ├── tacticDefinitions.js
│   └── translator.js
├── middleware.js
├── next.config.js
└── package.json
```

## 🛠️ Development Setup

### Node.js/JavaScript Setup
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install` or `yarn install`
3. Start development server: (Check scripts in `package.json`, e.g., `npm run dev`)


## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/TANICE-GAWD/AlwaysHerFault.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.
