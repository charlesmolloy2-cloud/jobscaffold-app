# Jobscaffold

A service professional to client communication platform.

## Tools

- TypeScript
- NextJS
- Firebase (Auth/cloud functions/firestore/file storage)
- OpenAI
- Tailwind
- ShadCN
- Figma
- Jest

## Spec-Driven Development (SDD)

This project follows strict orthodox spec driven devleopment! The project's spec is defined in two places. The user experience is completely documented by:

- /Users/chadmolloy/Documents/Jobscaffold/jobscaffold-docs/app/contractor/page.tsx
- /Users/chadmolloy/Documents/Jobscaffold/jobscaffold-docs/app/client/page.tsx

The visual design is completely defined by the figma wireframe prototypes:

- Contractor: https://www.figma.com/proto/tjvszfVi6VE9TR6FL0gfPW/Jobscaffold-Rev01?node-id=230-2&p=f&m=dev&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=230%3A2&show-proto-sidebar=1
- Client: https://www.figma.com/design/tjvszfVi6VE9TR6FL0gfPW/Jobscaffold-Rev01?node-id=12-2&p=f&t=Gy1GCAfug3vVxYPm-0

The agent never updates the spec. Only the human changes the spec. The spec is the sole sourse of truth for the app's user experience. The spec defines the user's experience in intuitive,  accessible, and human friendly terms. Technical details are defined in the README.md.

## Test-Driven Development (TDD)

This project follows strict orthodox test driven development! The agent's job is to define tests for all requirements in the spec. Only the specific requirements in the spec should be tested. If the spec is inconsistent, incorrect, or incomplete, the agent should collaborate with the human to update the spec to resolve the confusion. The agent should never add tests for requirements not in the spec. 

Application code should only be generated when specifically necessary to pass a failing test. Only tested requirements should be coded in the application. If the tests are inconsistent, incorrect, or incomplete, the agent should repair them to align with the spec. The agent should never add application code for un-tested requirements.

The agent is responsible for installing and configuring the test runner. If the test runner is not ready or is broken the agent should fix it.

## Firebase

The firebase project configuration is stored in `secrets.ts`. 

User registration must be implemented as a single cloud function that registers the user in the authentication database and only adds the user's firestore document after successful authentication registration. If authentication registration succeeds but the firestore document fails, the authentication account is deleted. User registration is only limited by firebase policy. 

Firebase development and testing uses local emulators.

### Firestore

#### `users`

| key | value | 
| --- | --- |
| firstName | string |
| lastName | string |
| companyName | string |
| email | string |
| contractor | boolean |
| createdAt | timestamp |

