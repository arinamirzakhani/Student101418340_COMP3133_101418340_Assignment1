const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar Date

  type User {
    _id: ID!
    username: String!
    email: String!
    created_at: Date
    updated_at: Date
  }

  type Employee {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String
    designation: String!
    salary: Float!
    date_of_joining: Date!
    department: String!
    employee_photo: String
    created_at: Date
    updated_at: Date
  }

  type AuthResponse {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  type EmployeeResponse {
    success: Boolean!
    message: String!
    employee: Employee
  }

  type EmployeesResponse {
    success: Boolean!
    message: String!
    employees: [Employee!]!
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  input EmployeeInput {
    first_name: String!
    last_name: String!
    email: String!
    gender: String
    designation: String!
    salary: Float!
    date_of_joining: Date!
    department: String!
    employee_photo: String
  }

  input EmployeeUpdateInput {
    first_name: String
    last_name: String
    email: String
    gender: String
    designation: String
    salary: Float
    date_of_joining: Date
    department: String
    employee_photo: String
  }

  type Query {
    # 2) Login
    login(usernameOrEmail: String!, password: String!): AuthResponse!

    # 3) Get all employees
    getAllEmployees: EmployeesResponse!

    # 5) Search employee by eid
    getEmployeeById(eid: ID!): EmployeeResponse!

    # 8) Search by designation OR department
    searchEmployees(designation: String, department: String): EmployeesResponse!
  }

  type Mutation {
    # 1) Signup
    signup(username: String!, email: String!, password: String!): AuthResponse!

    # 4) Add new employee
    addEmployee(input: EmployeeInput!): EmployeeResponse!

    # 6) Update by eid
    updateEmployee(eid: ID!, input: EmployeeUpdateInput!): EmployeeResponse!

    # 7) Delete by eid
    deleteEmployee(eid: ID!): DeleteResponse!
  }
`;
