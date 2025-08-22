import { Question } from '../types/quiz';

export const javaQuestions: Question[] = [
  {
    id: 1,
    question: "What is the default value of a boolean variable in Java?",
    options: ["true", "false", "0", "null"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "What is the size of an int in Java?",
    options: ["8-bit", "16-bit", "32-bit", "64-bit"],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "Which keyword is used to create a class in Java?",
    options: ["class", "Class", "new", "create"],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "What is the correct way to declare a constant in Java?",
    options: ["const int x = 5;", "final int x = 5;", "constant int x = 5;", "static int x = 5;"],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "Which of the following is NOT a primitive data type in Java?",
    options: ["int", "boolean", "String", "char"],
    correctAnswer: 2
  },
  {
    id: 6,
    question: "What does JVM stand for?",
    options: ["Java Virtual Machine", "Java Variable Method", "Java Version Manager", "Java Visual Module"],
    correctAnswer: 0
  },
  {
    id: 7,
    question: "Which access modifier provides the most restricted access?",
    options: ["public", "protected", "default", "private"],
    correctAnswer: 3
  },
  {
    id: 8,
    question: "What is the correct syntax to create an array in Java?",
    options: ["int[] arr = new int[5];", "int arr[] = new int(5);", "array int arr = new int[5];", "int arr = new array[5];"],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "Which method is called automatically when an object is created?",
    options: ["main()", "constructor", "init()", "create()"],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "What is the parent class of all classes in Java?",
    options: ["Class", "Parent", "Object", "Super"],
    correctAnswer: 2
  },
  {
    id: 11,
    question: "Which keyword is used to inherit a class in Java?",
    options: ["this", "super", "extends", "implements"],
    correctAnswer: 2
  },
  {
    id: 12,
    question: "What is the output of 10/3 in Java when both are integers?",
    options: ["3.33", "3", "4", "Error"],
    correctAnswer: 1
  },
  {
    id: 13,
    question: "Which of these is used to handle exceptions in Java?",
    options: ["try-catch", "throw-catch", "if-else", "error-check"],
    correctAnswer: 0
  },
  {
    id: 14,
    question: "Which package contains the Scanner class?",
    options: ["java.io", "java.util", "java.lang", "java.text"],
    correctAnswer: 1
  },
  {
    id: 15,
    question: "What is method overloading?",
    options: [
      "Same method name with different return types only",
      "Same method name with different parameters",
      "Same method name with different packages",
      "Same method name with different access modifiers only"
    ],
    correctAnswer: 1
  },
  {
    id: 16,
    question: "Which interface must be implemented to create a thread in Java?",
    options: ["Runnable", "Threadable", "Callable", "Executor"],
    correctAnswer: 0
  },
  {
    id: 17,
    question: "What is the size of a double in Java?",
    options: ["4 bytes", "8 bytes", "16 bytes", "Depends on OS"],
    correctAnswer: 1
  },
  {
    id: 18,
    question: "Which keyword is used to prevent inheritance in Java?",
    options: ["final", "static", "private", "protected"],
    correctAnswer: 0
  },
  {
    id: 19,
    question: "Which of these collections stores elements as key-value pairs?",
    options: ["List", "Set", "Map", "Queue"],
    correctAnswer: 2
  },
  {
    id: 20,
    question: "What is the default value of a reference variable in Java?",
    options: ["0", "undefined", "null", "empty"],
    correctAnswer: 2
  },
  {
    id: 21,
    question: "Which operator is used for bitwise AND in Java?",
    options: ["&&", "&", "|", "and"],
    correctAnswer: 1
  },
  {
    id: 22,
    question: "Which class is used to read text from the console in Java (pre-Java 1.5)?",
    options: ["Console", "BufferedReader", "Scanner", "InputStream"],
    correctAnswer: 1
  },
  {
    id: 23,
    question: "What is the purpose of the 'super' keyword in Java?",
    options: [
      "To call a superclass constructor or method",
      "To define constants",
      "To prevent inheritance",
      "To create objects"
    ],
    correctAnswer: 0
  },
  {
    id: 24,
    question: "Which method is the entry point for a Java program?",
    options: ["init()", "start()", "main()", "run()"],
    correctAnswer: 2
  },
  {
    id: 25,
    question: "Which keyword is used to define an abstract class in Java?",
    options: ["interface", "virtual", "abstract", "base"],
    correctAnswer: 2
  }
];