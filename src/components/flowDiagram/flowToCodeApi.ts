/* ───────────────────────────────────────────────────────────
 *  Mock API — Flow Diagram → Code / Explanation / Dry Run
 *
 *  Drop-in replacement: swap the body of `generateCodeFromFlow`
 *  with `axios.post('/api/flow-to-code', { flowDiagram })`.
 * ─────────────────────────────────────────────────────────── */

import type { FlowJSON, FlowToCodeResponse } from "./flowDiagramTypes";

/**
 * Analyses the flow JSON to produce contextual mock output.
 * Examines node types to decide whether the demo code
 * should feature loops, conditionals, I/O, etc.
 */
function buildMockResponse(flow: FlowJSON): FlowToCodeResponse {
  const hasLoop = flow.nodes.some((n) => n.type === "loop");
  const hasDecision = flow.nodes.some((n) => n.type === "decision");
  const hasIO = flow.nodes.some((n) => n.type === "input_output");

  /* ---------- pick a scenario ---------- */
  if (hasLoop && hasDecision) return loopWithDecision(flow);
  if (hasLoop) return simpleLoop(flow);
  if (hasDecision) return simpleDecision(flow);
  if (hasIO) return ioOnly();
  return fallback(flow);
}

/* ── helpers to extract user labels ──────────────────────── */

function loopCond(flow: FlowJSON): string {
  const n = flow.nodes.find((n) => n.type === "loop");
  return n?.condition || n?.label || "i < 5";
}

function decCond(flow: FlowJSON): string {
  const n = flow.nodes.find((n) => n.type === "decision");
  return n?.condition || n?.label || "x > 0";
}

/* ── scenario generators ─────────────────────────────────── */

function simpleLoop(flow: FlowJSON): FlowToCodeResponse {
  const cond = loopCond(flow);
  return {
    code: {
      c: `#include <stdio.h>\n\nint main() {\n    int i = 0;\n    while (${cond}) {\n        printf("i = %d\\n", i);\n        i++;\n    }\n    return 0;\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int i = 0;\n    while (${cond}) {\n        cout << "i = " << i << endl;\n        i++;\n    }\n    return 0;\n}`,
      python: `i = 0\nwhile ${cond}:\n    print(f"i = {i}")\n    i += 1`,
      java: `public class Main {\n    public static void main(String[] args) {\n        int i = 0;\n        while (${cond}) {\n            System.out.println("i = " + i);\n            i++;\n        }\n    }\n}`,
    },
    explanation: [
      "Step 1: Initialize a counter variable i to 0.",
      `Step 2: Enter a while loop with condition: ${cond}.`,
      "Step 3: Inside the loop, print the current value of i.",
      "Step 4: Increment i by 1 at each iteration.",
      "Step 5: When the condition becomes false, exit the loop.",
      "Step 6: Program terminates successfully.",
    ],
    dryRun: {
      input: "No external input required.",
      steps: [
        "i = 0 → condition true → print 'i = 0' → i becomes 1",
        "i = 1 → condition true → print 'i = 1' → i becomes 2",
        "i = 2 → condition true → print 'i = 2' → i becomes 3",
        "i = 3 → condition true → print 'i = 3' → i becomes 4",
        "i = 4 → condition true → print 'i = 4' → i becomes 5",
        "i = 5 → condition false → exit loop",
      ],
      output: "i = 0\ni = 1\ni = 2\ni = 3\ni = 4",
    },
  };
}

function simpleDecision(flow: FlowJSON): FlowToCodeResponse {
  const cond = decCond(flow);
  return {
    code: {
      c: `#include <stdio.h>\n\nint main() {\n    int x = 10;\n    if (${cond}) {\n        printf("Condition is TRUE\\n");\n    } else {\n        printf("Condition is FALSE\\n");\n    }\n    return 0;\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 10;\n    if (${cond}) {\n        cout << "Condition is TRUE" << endl;\n    } else {\n        cout << "Condition is FALSE" << endl;\n    }\n    return 0;\n}`,
      python: `x = 10\nif ${cond}:\n    print("Condition is TRUE")\nelse:\n    print("Condition is FALSE")`,
      java: `public class Main {\n    public static void main(String[] args) {\n        int x = 10;\n        if (${cond}) {\n            System.out.println("Condition is TRUE");\n        } else {\n            System.out.println("Condition is FALSE");\n        }\n    }\n}`,
    },
    explanation: [
      "Step 1: Declare variable x and assign value 10.",
      `Step 2: Evaluate condition: ${cond}.`,
      "Step 3: If condition is true, print 'Condition is TRUE'.",
      "Step 4: Otherwise, print 'Condition is FALSE'.",
      "Step 5: Program terminates.",
    ],
    dryRun: {
      input: "No external input. x = 10.",
      steps: [
        "x = 10",
        `Evaluate: ${cond} → TRUE (since x = 10)`,
        "Enter 'if' branch",
        "Print: 'Condition is TRUE'",
      ],
      output: "Condition is TRUE",
    },
  };
}

function loopWithDecision(flow: FlowJSON): FlowToCodeResponse {
  const lCond = loopCond(flow);
  const dCond = decCond(flow);
  return {
    code: {
      c: `#include <stdio.h>\n\nint main() {\n    for (int i = 0; ${lCond}; i++) {\n        if (${dCond}) {\n            printf("%d is positive\\n", i);\n        } else {\n            printf("%d does not satisfy\\n", i);\n        }\n    }\n    return 0;\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 0; ${lCond}; i++) {\n        if (${dCond}) {\n            cout << i << " is positive" << endl;\n        } else {\n            cout << i << " does not satisfy" << endl;\n        }\n    }\n    return 0;\n}`,
      python: `i = 0\nwhile ${lCond}:\n    if ${dCond}:\n        print(f"{i} is positive")\n    else:\n        print(f"{i} does not satisfy")\n    i += 1`,
      java: `public class Main {\n    public static void main(String[] args) {\n        for (int i = 0; ${lCond}; i++) {\n            if (${dCond}) {\n                System.out.println(i + " is positive");\n            } else {\n                System.out.println(i + " does not satisfy");\n            }\n        }\n    }\n}`,
    },
    explanation: [
      "Step 1: Initialize loop counter i = 0.",
      `Step 2: Loop while ${lCond}.`,
      `Step 3: Inside loop, check condition: ${dCond}.`,
      "Step 4: If true, print that i is positive.",
      "Step 5: Otherwise, print it does not satisfy.",
      "Step 6: Increment i and repeat.",
      "Step 7: Exit loop when condition fails.",
    ],
    dryRun: {
      input: "No external input required.",
      steps: [
        "i = 0 → check condition → branch accordingly → i++",
        "i = 1 → check condition → branch accordingly → i++",
        "i = 2 → check condition → branch accordingly → i++",
        "i = 3 → check condition → branch accordingly → i++",
        "i = 4 → check condition → branch accordingly → i++",
        "i = 5 → loop condition fails → exit",
      ],
      output: "0 is positive\n1 is positive\n2 is positive\n3 is positive\n4 is positive",
    },
  };
}

function ioOnly(): FlowToCodeResponse {
  return {
    code: {
      c: `#include <stdio.h>\n\nint main() {\n    int num;\n    printf("Enter a number: ");\n    scanf("%d", &num);\n    printf("You entered: %d\\n", num);\n    return 0;\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int num;\n    cout << "Enter a number: ";\n    cin >> num;\n    cout << "You entered: " << num << endl;\n    return 0;\n}`,
      python: `num = int(input("Enter a number: "))\nprint(f"You entered: {num}")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.print("Enter a number: ");\n        int num = sc.nextInt();\n        System.out.println("You entered: " + num);\n    }\n}`,
    },
    explanation: [
      "Step 1: Prompt the user to enter a number.",
      "Step 2: Read the integer from standard input.",
      "Step 3: Print the entered value back to the user.",
      "Step 4: Program terminates.",
    ],
    dryRun: {
      input: "42",
      steps: [
        "Display prompt: 'Enter a number: '",
        "User enters: 42",
        "Store 42 in variable num",
        "Print: 'You entered: 42'",
      ],
      output: "You entered: 42",
    },
  };
}

function fallback(flow: FlowJSON): FlowToCodeResponse {
  const nodeLabels = flow.nodes
    .filter((n) => n.type === "process")
    .map((n) => n.label || n.value || "// process step")
    .join("\n    ");

  return {
    code: {
      c: `#include <stdio.h>\n\nint main() {\n    ${nodeLabels || '// your logic here'}\n    printf("Done!\\n");\n    return 0;\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    ${nodeLabels || '// your logic here'}\n    cout << "Done!" << endl;\n    return 0;\n}`,
      python: `${nodeLabels || '# your logic here'}\nprint("Done!")`,
      java: `public class Main {\n    public static void main(String[] args) {\n        ${nodeLabels || '// your logic here'}\n        System.out.println("Done!");\n    }\n}`,
    },
    explanation: [
      "Step 1: Program starts execution.",
      ...flow.nodes
        .filter((n) => n.type !== "start" && n.type !== "end")
        .map(
          (n, i) =>
            `Step ${i + 2}: Execute ${n.type} block${n.label ? ` — "${n.label}"` : ""}.`,
        ),
      `Step ${flow.nodes.length}: Program outputs "Done!" and terminates.`,
    ],
    dryRun: {
      input: "No external input required.",
      steps: flow.nodes
        .filter((n) => n.type !== "start" && n.type !== "end")
        .map((n) => `Execute: ${n.label || n.type}`),
      output: "Done!",
    },
  };
}

/* ── public API ───────────────────────────────────────────── */

/**
 * Simulates calling POST /api/flow-to-code with 1.5 s latency.
 * Replace the body with a real axios call when a backend is ready.
 */
export async function generateCodeFromFlow(
  flowJSON: FlowJSON,
): Promise<FlowToCodeResponse> {
  /* simulate network delay */
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (flowJSON.nodes.length === 0) {
    throw new Error("The flow diagram is empty. Add some nodes first.");
  }

  return buildMockResponse(flowJSON);
}
