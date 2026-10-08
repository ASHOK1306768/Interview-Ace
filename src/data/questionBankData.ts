import { Question, CategoryTrack } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // Coding Problems
  {
    id: 1,
    category: 'Coding Problems',
    title: 'Write a function to check if a string is a palindrome. What is the time and space complexity?',
    idealStructure: 'Start by explaining the two-pointer approach comparing characters from left and right. Mention O(N) time complexity and O(1) auxiliary space.'
  },
  {
    id: 2,
    category: 'Coding Problems',
    title: 'How would you find the first non-repeated character in a string? Walk me through your code.',
    idealStructure: 'Use a hash map or frequency array to count character occurrences in the first pass, then iterate through the string again to find the first character with a count of 1. Time complexity: O(N), Space complexity: O(1) since character set is bounded.'
  },
  {
    id: 3,
    category: 'Coding Problems',
    title: 'Given an array of integers, write an algorithm to find the two numbers that add up to a specific target sum (Two Sum problem).',
    idealStructure: 'Detail the hash map approach storing complements (target - current_val). Explain why this improves brute force O(N^2) to O(N) time complexity with O(N) space.'
  },
  {
    id: 4,
    category: 'Coding Problems',
    title: 'Explain how you would reverse a singly linked list in-place.',
    idealStructure: 'Describe maintaining three pointers: prev, current, and next. Iterate through the list reassigning current.next = prev until current is null. Return prev as the new head. Time O(N), Space O(1).'
  },
  {
    id: 5,
    category: 'Coding Problems',
    title: 'What is the difference between recursion and iteration? Show how you would implement a Fibonacci generator using both.',
    idealStructure: 'Compare call stack overhead and risk of stack overflow in naive recursion vs memory efficiency in iteration or memoized tail recursion.'
  },
  {
    id: 6,
    category: 'Coding Problems',
    title: 'Design a Producer-Consumer thread synchronization mechanism using wait and notify.',
    idealStructure: 'Explain using a shared queue with max capacity, synchronizing on a monitor object, and checking queue conditions inside a while loop.'
  },
  {
    id: 7,
    category: 'Coding Problems',
    title: 'Explain how you would evaluate a postfix mathematical expression using a stack.',
    idealStructure: 'Scan tokens left-to-right. Push operands onto stack; when an operator is encountered, pop top two operands, evaluate, and push result back.'
  },
  {
    id: 8,
    category: 'Coding Problems',
    title: 'Write an efficient algorithm that searches for a value in an m x n matrix with sorted rows and columns.',
    idealStructure: 'Start at top-right or bottom-left corner. Eliminate a row or column at each step in O(M + N) time.'
  },
  {
    id: 9,
    category: 'Coding Problems',
    title: 'Implement a Stack using only two Queues. What are the time complexities of push and pop?',
    idealStructure: 'Explain making either push operation O(N) by transferring elements between queues or pop operation O(N).'
  },
  {
    id: 10,
    category: 'Coding Problems',
    title: 'Explain how you would merge K sorted lists of size N into a single sorted list efficiently.',
    idealStructure: 'Use a Min-Heap (Priority Queue) of size K. Time complexity: O(N*K log K), Space: O(K).'
  },

  // Frontend Dev
  {
    id: 101,
    category: 'Frontend Dev',
    title: 'Can you explain the difference between the Virtual DOM and the Real DOM in React, and how it impacts performance?',
    idealStructure: 'Discuss lightweight in-memory representation, reconciliation algorithm (diffing), batching DOM updates, and minimizing expensive actual browser reflows.'
  },
  {
    id: 102,
    category: 'Frontend Dev',
    title: 'How do you optimize the performance of a modern web application? Mention at least 3 distinct techniques.',
    idealStructure: 'Cover code splitting/lazy loading, asset compression/CDN caching, image optimization, memoization (useMemo/useCallback), and tree shaking.'
  },
  {
    id: 103,
    category: 'Frontend Dev',
    title: 'Describe your experience with CSS layouts (Flexbox, Grid, etc.) and your approach to building responsive interfaces.',
    idealStructure: 'Explain mobile-first design, fluid units, CSS Grid for two-dimensional layouts vs Flexbox for linear components, and media query strategies.'
  },
  {
    id: 104,
    category: 'Frontend Dev',
    title: 'What is a closure in JavaScript, and what are some common use cases for it?',
    idealStructure: 'Define closure as a function retaining access to its lexical scope even when executed outside that scope. Cite data privacy, currying, and event listeners.'
  },
  {
    id: 105,
    category: 'Frontend Dev',
    title: 'Tell me about a challenging frontend bug you encountered and how you went about resolving it.',
    idealStructure: 'Use STAR method: Situation, Task, Action (profiling, DevTools breakpoints, reproduction step), and Result/Prevention.'
  },

  // Backend Dev
  {
    id: 201,
    category: 'Backend Dev',
    title: 'What is the difference between SQL and NoSQL databases, and how do you decide which one to use for a project?',
    idealStructure: 'Compare relational ACID transactions/schema enforcement vs document/key-value horizontal scalability, flexible schema, and eventual consistency.'
  },
  {
    id: 202,
    category: 'Backend Dev',
    title: 'Explain the concepts of authentication and authorization, and how you would secure a REST API.',
    idealStructure: 'Differentiate identity verification (OAuth/JWT) vs access permissions (RBAC). Discuss HTTPS, CORS, rate limiting, and input sanitization.'
  },
  {
    id: 203,
    category: 'Backend Dev',
    title: 'How do you design a database schema to scale for high-concurrency read and write operations?',
    idealStructure: 'Discuss indexing strategies, read replicas, database sharding/partitioning, caching layers (Redis), and connection pooling.'
  },

  // Data Science / ML
  {
    id: 301,
    category: 'Data Science / ML',
    title: 'What is overfitting in machine learning models, and what techniques do you use to prevent it?',
    idealStructure: 'Define overfitting (high variance). Discuss cross-validation, regularization (L1/L2), dropout, early stopping, and data augmentation.'
  },
  {
    id: 302,
    category: 'Data Science / ML',
    title: 'Explain the bias-variance tradeoff in machine learning and how it affects model selection.',
    idealStructure: 'Define underfitting (high bias) vs overfitting (high variance) and total error decomposition.'
  },

  // Product Management
  {
    id: 401,
    category: 'Product Management',
    title: 'How do you prioritize features when building a product roadmap, especially when dealing with conflicting stakeholder opinions?',
    idealStructure: 'Frame using RICE, MoSCoW, or Kano frameworks. Emphasize data-driven customer metrics and business goals.'
  },

  // Behavioral & HR
  {
    id: 501,
    category: 'Behavioral & HR',
    title: 'Tell me about yourself, your background, and why you are interested in this specific role.',
    idealStructure: 'Present a concise elevator pitch: Past achievements, Present skills/focus, and Future alignment with company mission.'
  },
  {
    id: 502,
    category: 'Behavioral & HR',
    title: 'Describe a situation where you had a conflict with a team member. How did you handle it and what was the outcome?',
    idealStructure: 'Emphasize empathy, active listening, objective problem solving, and building alignment.'
  }
];

// Generate synthetic questions to reach 100 questions for key banks
export const generateQuestionPool = (category: CategoryTrack): Question[] => {
  const existing = INITIAL_QUESTIONS.filter(q => q.category === category);
  if (existing.length >= 100) return existing;
  
  const pool = [...existing];
  const templates: Record<string, string[]> = {
    'Coding Problems': [
      'Write an algorithm to find the longest consecutive sequence of integers in an unsorted array in O(N) time.',
      'Design a Least Recently Used (LRU) Cache that supports get and put operations in O(1) time.',
      'Explain how you would find the K-th largest element in an unsorted array. Compare QuickSelect vs Heap.',
      'Given a binary tree, implement level-order traversal (BFS) and return node values level by level.',
      'How would you solve the Coin Change problem (finding minimum coins to reach a target sum)?',
      'Implement Dijkstra Algorithm for finding the shortest path in a weighted graph.',
      'Write a function to validate if a string of parentheses is balanced (e.g. "{[()]}").',
      'Design a data structure that supports insert, delete, and getRandom in O(1) time.',
      'Explain the Edit Distance (Levenshtein distance) dynamic programming solution.',
      'Write an efficient algorithm to detect a cycle in a linked list using Floyd Cycle-Finding Algorithm.'
    ],
    'Aptitude & Logic': [
      'How would you measure exactly 4 gallons of water using only a 3-gallon jug and a 5-gallon jug?',
      'You have 8 balls that look identical, but 1 is slightly heavier. Using a balance scale, what is the minimum number of weighings needed?',
      'Explain the Monty Hall problem and why switching doors yields a 2/3 probability of winning.',
      'Two trains 100 miles apart travel toward each other at 50 mph. A fly flies between them at 75 mph. How far does the fly travel before collision?',
      'If you have 1000 bottles of wine and 1 is poisoned, what is the minimum number of test mice required to find the poisoned bottle in 24 hours?'
    ],
    'Frontend Dev': [
      'Explain the concept of event delegation in JavaScript and why it is useful for dynamic lists.',
      'What are Web Workers, and how do they enable multithreaded processing in browser environments?',
      'Compare server-side rendering (SSR) vs client-side rendering (CSR) vs static site generation (SSG).',
      'How does the browser rendering pipeline work (HTML parsing, DOM tree, CSSOM, Render Tree, Layout, Paint)?',
      'What are progressive web apps (PWAs), and what role do Service Workers play?'
    ]
  };

  const poolTemplates = templates[category] || [
    `Describe your methodology for solving complex challenges in ${category}.`,
    `Walk through a system architecture design suitable for ${category} at scale.`,
    `What are the most common performance bottlenecks in ${category} and how do you diagnose them?`,
    `How do you stay up-to-date with emerging trends and best practices in ${category}?`
  ];

  let idCounter = existing.length + 1 + (category === 'Coding Problems' ? 0 : 1000);

  while (pool.length < 100) {
    const templateIdx = (pool.length - existing.length) % poolTemplates.length;
    const baseText = poolTemplates[templateIdx];
    const itemNum = pool.length + 1;
    
    pool.push({
      id: idCounter++,
      category,
      title: pool.length < poolTemplates.length + existing.length 
        ? baseText 
        : `${baseText} (Variation #${itemNum})`,
      idealStructure: `Structure response systematically with core concepts, practical examples, edge cases, and trade-off considerations for ${category}.`
    });
  }

  return pool;
};
