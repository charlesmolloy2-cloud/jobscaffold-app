# Jobscaffold 

A service professional to client communication platform.

## Tools

- TypeScript
- NextJS
- Firebase (Auth/cloud fucntions/firestore/file storage)
- OpenAI
- Tailwind
- ShadCN
- Figma
 - Jest

## Spec-Driven Development (SDD)

This project follows strict othodocs spec driven devleopment! The projects spec is defined in the jobscaffold-docs pages and the figma prototypes:

- Contractor: https://www.figma.com/proto/tjvszfVi6VE9TR6FL0gfPW/Jobscaffold-Rev01?node-id=230-2&p=f&m=dev&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=230%3A2&show-proto-sidebar=1
- Client: https://www.figma.com/design/tjvszfVi6VE9TR6FL0gfPW/Jobscaffold-Rev01?node-id=12-2&p=f&t=Gy1GCAfug3vVxYPm-0

The agent never updates the spec. Only the human changes the spec. The spec is the sole sourse of truth for the apps uer experince. The spec defines the user experince intuative exessible and human friendly terms. Technical details are defined in the README.md.

## Test-Driven Development (TDD)

This project follows strict orthodocs test driven development! The agents job is to define tests for all requirements in the spec. Only the specific requiremnents in the spec should be tested. If the spec is inconsistant, incorrect or incomplete the agent should collaborate with the human to update the spec to resolve the conculsion. The agent should never add tests for requirements not in the spec. 

Application code should only be generated when specifically neccissary to pass a failing test, only tested requirements should be coded in the applciation. If the tests are inconsistant, incorrect or incomplete the agent should repair them to align with the spec. The agent should never add application code for un-tested requirements.

