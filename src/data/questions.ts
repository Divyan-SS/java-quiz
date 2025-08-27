import { Question } from '../types/quiz';

export const excelQuestions: Question[] = [
  {
    id: 1,
    question: "Which symbol is used to start a formula in Excel?",
    options: ["+", "-", "=", "@"],
    correctAnswer: 2
  },
  {
    id: 2,
    question: "Which of the following is a What-If Analysis tool in Excel?",
    options: ["Flash Fill", "Goal Seek", "Data Validation", "Power Query"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "To create a Pivot Table, you go to:",
    options: ["Insert → Pivot Table", "Home → Table → Pivot", "Data → Pivot Table", "View → Pivot"],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "Which function adds values in a range?",
    options: ["TOTAL()", "SUM()", "ADD()", "PLUS()"],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "Which function counts cells based on a condition?",
    options: ["COUNTIF", "SUMIF", "IFCOUNT", "COUNT"],
    correctAnswer: 0
  },
  {
    id: 6,
    question: "Power BI is mainly used for:",
    options: ["Data visualization and business intelligence", "Video editing", "Web development", "Database design only"],
    correctAnswer: 0
  },
  {
    id: 7,
    question: "Which of the following is NOT a data source in Power BI?",
    options: ["Excel", "SQL Server", "Photoshop", "Google Analytics"],
    correctAnswer: 2
  },
  {
    id: 8,
    question: "What does DAX stand for?",
    options: ["Data Analytics Execution", "Data Access Extension", "Dynamic Analysis Expressions", "Data Analysis Expressions"],
    correctAnswer: 3
  },
  {
    id: 9,
    question: "Which visualization is best suited to show trends over time?",
    options: ["Tree Map", "Line Chart", "Pie Chart", "Donut Chart"],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "Which feature is used to share reports securely in Power BI?",
    options: ["Power BI Service", "Power BI Gateway", "Publish to Web", "Power BI Desktop"],
    correctAnswer: 0
  },
  {
    id: 11,
    question: "Power BI is developed by:",
    options: ["Microsoft", "Oracle", "IBM", "Google"],
    correctAnswer: 0
  },
  {
    id: 12,
    question: "Which option is used to get data into Power BI?",
    options: ["Home → Insert", "Home → Get Data", "File → Export", "View → Data"],
    correctAnswer: 1
  },
  {
    id: 13,
    question: "In Power BI, which view is used to create relationships between tables?",
    options: ["Query View", "Data View", "Model View", "Report View"],
    correctAnswer: 2
  },
  {
    id: 14,
    question: "Power BI dashboards can have data from:",
    options: ["Excel only", "Multiple reports and datasets", "SQL Server only", "A single report only"],
    correctAnswer: 1
  },
  {
    id: 15,
    question: "Which option is used to replace incorrect or missing values in Power Query?",
    options: ["Replace Values", "Remove Values", "Fill Down", "Group By"],
    correctAnswer: 0
  },
  {
    id: 16,
    question: "Which option is used to transpose data (convert rows to columns)?",
    options: ["Pivot Column", "Transpose", "Unpivot Columns", "Group By"],
    correctAnswer: 1
  },
  {
    id: 17,
    question: "Which option is commonly used to rename a column in Power Query?",
    options: ["Right-click the column → Rename", "Transform → Format → Rename Columns", "Home → Manage Columns → Change Name", "Data → Rename Fields"],
    correctAnswer: 0
  },
  {
    id: 18,
    question: "What happens if you choose “Split Column → By Positions”?",
    options: ["The column is split based on character positions you specify", "The column is split at each space", "The column is duplicated", "The column is split into equal parts automatically"],
    correctAnswer: 0
  },
  {
    id: 19,
    question: "When you duplicate a column, the new column will contain:",
    options: ["The exact same values as the original column", "Only headers", "Blank values", "Random numbers"],
    correctAnswer: 0
  },
  {
    id: 20,
    question: "Which formula is correct for conditional sum with multiple criteria?",
    options: ["SUMIF", "COUNTIF", "SUMIFS", "AVERAGE"],
    correctAnswer: 2
  },
  {
    id: 21,
    question: "HLOOKUP works by searching:",
    options: ["In columns (vertically)", "In rows (horizontally)", "In both rows and columns", "In pivot tables"],
    correctAnswer: 1
  },
  {
    id: 22,
    question: "The fourth argument in VLOOKUP [range_lookup] is used to:",
    options: ["Decide column number", "Choose exact or approximate match", "Select row number", "Sort the data"],
    correctAnswer: 1
  },
  {
    id: 23,
    question: "In VLOOKUP, the function searches for the value in which direction?",
    options: ["Horizontal (across a row)", "Vertical (down a column)", "Both directions", "Random"],
    correctAnswer: 1
  },
  {
    id: 24,
    question: "The function =COUNTIF(A1:A10,\"Apple\") will:",
    options: ["Count all cells containing “Apple”", "Add all cells where “Apple” exists", "Return length of word Apple", "Show error"],
    correctAnswer: 0
  },
  {
    id: 25,
    question: "To sum sales where Product = \"Pen\" and Region = \"North\", which formula is correct?",
    options: ["=SUM(A1:A10,\"Pen\")", "=SUMIFS(C1:C10,A1:A10,\"Pen\",B1:B10,\"North\")", "=SUMIF(A1:A10,\"Pen\",B1:B10)", "=SUMIF(C1:C10,\"North\")"],
    correctAnswer: 1
  }
];
