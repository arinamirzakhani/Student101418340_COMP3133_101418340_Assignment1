const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");
const User = require("../models/User");
const Employee = require("../models/Employee");

function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError("Unauthorized. Please login first.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }
}

module.exports = {
  Query: {
    // 2) Login (username/email + password)
    login: async (_, { usernameOrEmail, password }) => {
      const user = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });

      if (!user) {
        return { success: false, message: "Invalid credentials", token: null, user: null };
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return { success: false, message: "Invalid credentials", token: null, user: null };
      }

      const token = jwt.sign(
        { userId: user._id.toString(), username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return { success: true, message: "Login successful", token, user };
    },

    // 3) Get all employees
    getAllEmployees: async (_, __, context) => {
      requireAuth(context);
      const employees = await Employee.find().sort({ created_at: -1 });
      return { success: true, message: "Employees fetched", employees };
    },

    // 5) Search employee by eid
    getEmployeeById: async (_, { eid }, context) => {
      requireAuth(context);
      const employee = await Employee.findById(eid);
      if (!employee) {
        return { success: false, message: "Employee not found", employee: null };
      }
      return { success: true, message: "Employee found", employee };
    },

    // 8) Search by designation OR department
    searchEmployees: async (_, { designation, department }, context) => {
      requireAuth(context);

      if (!designation && !department) {
        return { success: false, message: "Provide designation or department", employees: [] };
      }

      const query = {};
      if (designation) query.designation = new RegExp(designation, "i");
      if (department) query.department = new RegExp(department, "i");

      const employees = await Employee.find(query);
      return { success: true, message: "Search complete", employees };
    },
  },

  Mutation: {
    // 1) Signup
    signup: async (_, { username, email, password }) => {
      const existing = await User.findOne({ $or: [{ username }, { email }] });
      if (existing) {
        return { success: false, message: "Username or email already exists", token: null, user: null };
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed });

      const token = jwt.sign(
        { userId: user._id.toString(), username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return { success: true, message: "Signup successful", token, user };
    },

    // 4) Add Employee
    addEmployee: async (_, { input }, context) => {
      requireAuth(context);

      // salary rule already in schema (min 1000), but we can return nicer error:
      if (input.salary < 1000) {
        return { success: false, message: "salary must be >= 1000", employee: null };
      }

      const exists = await Employee.findOne({ email: input.email });
      if (exists) {
        return { success: false, message: "Employee email already exists", employee: null };
      }

      const employee = await Employee.create(input);
      return { success: true, message: "Employee created", employee };
    },

    // 6) Update Employee
    updateEmployee: async (_, { eid, input }, context) => {
      requireAuth(context);

      if (input.salary !== undefined && input.salary < 1000) {
        return { success: false, message: "salary must be >= 1000", employee: null };
      }

      // prevent duplicate email on update (optional but good)
      if (input.email) {
        const duplicate = await Employee.findOne({ email: input.email, _id: { $ne: eid } });
        if (duplicate) {
          return { success: false, message: "Employee email already exists", employee: null };
        }
      }

      const employee = await Employee.findByIdAndUpdate(eid, input, { new: true });
      if (!employee) {
        return { success: false, message: "Employee not found", employee: null };
      }

      return { success: true, message: "Employee updated", employee };
    },

    // 7) Delete Employee
    deleteEmployee: async (_, { eid }, context) => {
      requireAuth(context);

      const deleted = await Employee.findByIdAndDelete(eid);
      if (!deleted) {
        return { success: false, message: "Employee not found" };
      }
      return { success: true, message: "Employee deleted" };
    },
  },
};
