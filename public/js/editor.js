/**
 * Editor Configuration and Code Preset Templates
 */

const CODE_PRESETS = {
  c: {
    blank: {
      name: "✦ Blank / Custom Code (Type your own)",
      code: `#include <stdio.h>

int main() {
    // Write or paste your C code here
    
    return 0;
}`
    },
    two_sum: {
      name: "1. Two Sum — Quadratic Nested Loop O(n²)",
      code: `#include <stdio.h>

// Brute force Two Sum algorithm with O(n²) time complexity
void findTwoSum(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] + arr[j] == target) {
                printf("Found pair at indices: %d and %d\\n", i, j);
                return;
            }
        }
    }
    printf("No valid pair found.\\n");
}

int main() {
    int numbers[] = {2, 7, 11, 15, 18, 22};
    int n = 6;
    int target = 26;
    
    findTwoSum(numbers, n, target);
    return 0;
}`
    },
    out_of_bounds: {
      name: "2. Array Out of Bounds Bug (arr[5] loop to <= 5)",
      code: `#include <stdio.h>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    
    printf("Printing array elements:\\n");
    // BUG: Loop condition 'i <= 5' causes off-by-one out-of-bounds read!
    for (int i = 0; i <= 5; i++) {
        printf("Index %d = %d\\n", i, arr[i]);
    }
    
    return 0;
}`
    },
    memory_leak: {
      name: "3. Heap Memory Leak (malloc without free)",
      code: `#include <stdio.h>
#include <stdlib.h>

void processUserData(int count) {
    // Allocating dynamic memory on heap
    int *data = (int *)malloc(count * sizeof(int));
    
    if (data == NULL) {
        printf("Memory allocation failed\\n");
        return;
    }
    
    for (int i = 0; i < count; i++) {
        data[i] = i * 10;
        printf("%d ", data[i]);
    }
    printf("\\n");
    
    // BUG: Missing free(data)! Memory leak occurs when function returns.
}

int main() {
    processUserData(10);
    return 0;
}`
    },
    fibonacci: {
      name: "4. Exponential Recursion O(2^n) (Fibonacci)",
      code: `#include <stdio.h>

// Exponential time O(2^n) due to redundant recursive branch calculation
int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int n = 10;
    printf("Fibonacci of %d is %d\\n", n, fibonacci(n));
    return 0;
}`
    },
    infinite_loop: {
      name: "5. Suspicious Condition & Infinite Loop",
      code: `#include <stdio.h>

int main() {
    int status = 0;
    int unusedValue = 100; // Warning: Unused variable
    
    // BUG 1: Assignment in condition (= instead of ==)
    if (status = 5) {
        printf("Status is five\\n");
    }
    
    // BUG 2: Infinite loop with no break/return
    while (1) {
        printf("Running forever...\\n");
    }
    
    return 0;
}`
    },
    binary_search: {
      name: "6. Clean O(log n) Binary Search (Optimal)",
      code: `#include <stdio.h>

// Optimal O(log n) time and O(1) space binary search
int binarySearch(int arr[], int size, int target) {
    int low = 0;
    int high = size - 1;
    
    while (low <= high) {
        int mid = low + (high - low) / 2;
        
        if (arr[mid] == target) {
            return mid; // Target found
        }
        if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    
    return -1; // Not found
}

int main() {
    int arr[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int size = 10;
    int target = 23;
    
    int result = binarySearch(arr, size, target);
    if (result != -1) {
        printf("Element found at index: %d\\n", result);
    } else {
        printf("Element not found\\n");
    }
    
    return 0;
}`
    },
    graph_dijkstra: {
      name: "7. ⚡ Multi-Function Dijkstra Shortest Path & Graph System",
      code: `#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <stdbool.h>

#define MAX_VERTICES 6

// Graph adjacency matrix representation
typedef struct Graph {
    int numVertices;
    int adjMatrix[MAX_VERTICES][MAX_VERTICES];
} Graph;

// Function 1: Initialize graph with zero weights
Graph* createGraph(int vertices) {
    Graph* graph = (Graph*)malloc(sizeof(Graph));
    if (graph == NULL) {
        printf("Memory allocation failed\\n");
        return NULL;
    }
    graph->numVertices = vertices;
    for (int i = 0; i < vertices; i++) {
        for (int j = 0; j < vertices; j++) {
            graph->adjMatrix[i][j] = 0;
        }
    }
    return graph;
}

// Function 2: Add directed weighted edge
void addEdge(Graph* graph, int src, int dest, int weight) {
    if (src >= 0 && src < graph->numVertices && dest >= 0 && dest < graph->numVertices) {
        graph->adjMatrix[src][dest] = weight;
        graph->adjMatrix[dest][src] = weight; // Undirected
    }
}

// Function 3: Find minimum distance vertex not yet processed
int findMinDistanceVertex(int dist[], bool visited[], int vertices) {
    int min = INT_MAX, minIndex = -1;
    for (int v = 0; v < vertices; v++) {
        if (!visited[v] && dist[v] <= min) {
            min = dist[v];
            minIndex = v;
        }
    }
    return minIndex;
}

// Function 4: Display computed shortest paths
void printShortestPaths(int dist[], int parent[], int src, int vertices) {
    printf("Vertex\\tDistance from Source (%d)\\tParent\\n", src);
    for (int i = 0; i < vertices; i++) {
        printf("%d -> %d\\t\\t%d\\t\\t%d\\n", src, i, dist[i], parent[i]);
    }
}

// Function 5: Core Dijkstra algorithm solver
void dijkstra(Graph* graph, int src) {
    int dist[MAX_VERTICES];
    bool visited[MAX_VERTICES];
    int parent[MAX_VERTICES];

    for (int i = 0; i < graph->numVertices; i++) {
        dist[i] = INT_MAX;
        visited[i] = false;
        parent[i] = -1;
    }

    dist[src] = 0;

    for (int count = 0; count < graph->numVertices - 1; count++) {
        int u = findMinDistanceVertex(dist, visited, graph->numVertices);
        if (u == -1) break;

        visited[u] = true;

        for (int v = 0; v < graph->numVertices; v++) {
            if (!visited[v] && graph->adjMatrix[u][v] && 
                dist[u] != INT_MAX && 
                dist[u] + graph->adjMatrix[u][v] < dist[v]) {
                dist[v] = dist[u] + graph->adjMatrix[u][v];
                parent[v] = u;
            }
        }
    }

    printShortestPaths(dist, parent, src, graph->numVertices);
}

// Function 6: Clean up allocated graph memory
void freeGraph(Graph* graph) {
    if (graph != NULL) {
        free(graph);
    }
}

// Main execution entry point
int main() {
    int V = 5;
    Graph* network = createGraph(V);
    
    if (network == NULL) return 1;

    addEdge(network, 0, 1, 4);
    addEdge(network, 0, 2, 2);
    addEdge(network, 1, 2, 1);
    addEdge(network, 1, 3, 5);
    addEdge(network, 2, 3, 8);
    addEdge(network, 2, 4, 10);
    addEdge(network, 3, 4, 2);

    printf("Executing Dijkstra shortest path graph traversal...\\n");
    dijkstra(network, 0);

    freeGraph(network);
    return 0;
}`
    },
    dp_knapsack: {
      name: "8. ⚡ Dynamic Programming 0/1 Knapsack & DP Matrix Solver",
      code: `#include <stdio.h>
#include <stdlib.h>

// Utility function to find maximum
int getMax(int a, int b) {
    return (a > b) ? a : b;
}

// Helper to allocate 2D dynamic table
int** allocateTable(int rows, int cols) {
    int** table = (int**)malloc(rows * sizeof(int*));
    for (int i = 0; i < rows; i++) {
        table[i] = (int*)malloc(cols * sizeof(int));
    }
    return table;
}

// Free allocated DP table
void freeTable(int** table, int rows) {
    for (int i = 0; i < rows; i++) {
        free(table[i]);
    }
    free(table);
}

// Core Dynamic Programming 0/1 Knapsack Matrix computation
int solveKnapsackDP(int capacity, int weights[], int values[], int n) {
    int** dp = allocateTable(n + 1, capacity + 1);

    // Build DP table in bottom-up manner
    for (int i = 0; i <= n; i++) {
        for (int w = 0; w <= capacity; w++) {
            if (i == 0 || w == 0) {
                dp[i][w] = 0;
            } else if (weights[i - 1] <= w) {
                dp[i][w] = getMax(
                    values[i - 1] + dp[i - 1][w - weights[i - 1]],
                    dp[i - 1][w]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    int maxProfit = dp[n][capacity];
    freeTable(dp, n + 1);
    return maxProfit;
}

int main() {
    int values[] = {60, 100, 120, 200};
    int weights[] = {10, 20, 30, 40};
    int capacity = 50;
    int n = 4;

    printf("Calculating maximum knapsack value...\\n");
    int result = solveKnapsackDP(capacity, weights, values, n);
    printf("Optimal Max Knapsack Value = %d\\n", result);

    return 0;
}`
    }
  },
  cpp: {
    blank: {
      name: "✦ Blank / Custom Code (Type your own)",
      code: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    // Write or paste your C++ code here
    
    return 0;
}`
    },
    vector_loop: {
      name: "1. C++ Vector Traversal & Algorithm",
      code: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    vector<int> nums = {10, 20, 30, 40, 50};
    for (size_t i = 0; i < nums.size(); ++i) {
        cout << "Element " << i << ": " << nums[i] << endl;
    }
    return 0;
}`
    }
  },
  python: {
    blank: {
      name: "✦ Blank / Custom Code (Type your own)",
      code: `# Write or paste your Python code here

def main():
    pass

if __name__ == "__main__":
    main()`
    },
    nested_loops: {
      name: "1. Python Nested Loops & Mutable Default Arg",
      code: `# Python Example with O(n^2) nested loop and mutable default arg bug

def append_to_cache(item, cache=[]):
    # BUG: Mutable default list retains items across calls
    cache.append(item)
    return cache

def find_duplicates(numbers):
    duplicates = []
    # O(n^2) nested traversal
    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            if numbers[i] == numbers[j] and numbers[i] not in duplicates:
                duplicates.append(numbers[i])
    return duplicates

items = [1, 2, 3, 2, 4, 5, 1]
print("Duplicates:", find_duplicates(items))`
    }
  },
  java: {
    blank: {
      name: "✦ Blank / Custom Code (Type your own)",
      code: `public class Solution {
    public static void main(String[] args) {
        // Write or paste your Java code here
    }
}`
    },
    string_bug: {
      name: "1. Java String '==' Bug & Reference Mismatch",
      code: `public class StringChecker {
    public static void main(String[] args) {
        String s1 = new String("hello");
        String s2 = "hello";
        
        // BUG: In Java, == checks memory references, not string values!
        if (s1 == "hello") {
            System.out.println("Strings match");
        } else {
            System.out.println("Reference mismatch!");
        }
    }
}`
    }
  },
  javascript: {
    blank: {
      name: "✦ Blank / Custom Code (Type your own)",
      code: `// Write or paste your JavaScript code here

function solve() {
    
}

solve();`
    }
  }
};

class EditorManager {
  constructor(textareaId) {
    this.textarea = document.getElementById(textareaId);
    this.editor = null;
    this.initEditor();
  }

  initEditor() {
    // If CodeMirror is loaded via CDN
    if (window.CodeMirror) {
      this.editor = CodeMirror.fromTextArea(this.textarea, {
        lineNumbers: true,
        mode: 'text/x-csrc',
        theme: 'dracula',
        matchBrackets: true,
        autoCloseBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: true,
        viewportMargin: Infinity,
        styleActiveLine: true
      });
    }
  }

  getCode() {
    if (this.editor) {
      return this.editor.getValue();
    }
    return this.textarea.value;
  }

  setCode(code) {
    if (this.editor) {
      this.editor.setValue(code);
    } else {
      this.textarea.value = code;
    }
  }

  setLanguage(lang) {
    if (!this.editor) return;
    
    let mode = 'text/x-csrc';
    if (lang === 'cpp') mode = 'text/x-c++src';
    else if (lang === 'python') mode = 'text/x-python';
    else if (lang === 'java') mode = 'text/x-java';
    else if (lang === 'javascript') mode = 'text/javascript';

    this.editor.setOption('mode', mode);
  }

  loadPreset(lang, presetKey) {
    const langPresets = CODE_PRESETS[lang] || CODE_PRESETS['c'];
    const preset = langPresets[presetKey] || Object.values(langPresets)[0];
    if (preset) {
      this.setCode(preset.code);
    }
  }

  highlightLine(lineNumber) {
    if (!this.editor || !lineNumber) return;
    this.editor.setCursor(lineNumber - 1, 0);
    this.editor.scrollIntoView({ line: lineNumber - 1, ch: 0 }, 100);
  }

  flashLine(lineNumber) {
    if (!this.editor || !lineNumber) return;
    const lineIdx = lineNumber - 1;
    this.editor.setCursor(lineIdx, 0);
    this.editor.scrollIntoView({ line: lineIdx, ch: 0 }, 100);
    
    // Add visual glowing background class
    this.editor.addLineClass(lineIdx, 'background', 'cm-line-fixed-glow');
    setTimeout(() => {
      if (this.editor) {
        this.editor.removeLineClass(lineIdx, 'background', 'cm-line-fixed-glow');
      }
    }, 2400);
  }
}

window.CODE_PRESETS = CODE_PRESETS;
window.EditorManager = EditorManager;
