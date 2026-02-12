const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GraphQLError, GraphQLScalarType, Kind } = require("graphql");
const User = require("../models/User");
const Employee = require("../models/Employee");


const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Custom Date scalar",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError("Unauthorized. Please login first.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }
}

// helper: make mongoose errors readable for screenshots
function formatMongooseError(err) {
  // Mongoose validation errors
  if (err && err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return messages.join(" | ");
  }

  // Duplicate key error (unique email, etc.)
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
    return `${field} already exists`;
  }

  return err?.message || "Something went wrong";
}

module.exports = {
  
  Date: DateScalar,

  Query: {
    
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

    getAllEmployees: async (_, __, context) => {
      requireAuth(context);

      const employees = await Employee.find().sort({ createdAt: -1, created_at: -1 });

      return { success: true, message: "Employees fetched", employees };
    },

    
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
   
    signup: async (_, { username, email, password }) => {
      try {
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
          return {
            success: false,
            message: "Username or email already exists",
            token: null,
            user: null,
          };
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashed });

        const token = jwt.sign(
          { userId: user._id.toString(), username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "2h" }
        );

        return { success: true, message: "Signup successful", token, user };
      } catch (err) {
        return { success: false, message: formatMongooseError(err), token: null, user: null };
      }
    },

    
    addEmployee: async (_, { input }, context) => {
      requireAuth(context);

      
      if (input.salary < 1000) {
        return { success: false, message: "salary must be >= 1000", employee: null };
      }

      try {
        const exists = await Employee.findOne({ email: input.email });
        if (exists) {
          return { success: false, message: "Employee email already exists", employee: null };
        }

        const employee = await Employee.create(input);
        return { success: true, message: "Employee created", employee };
      } catch (err) {
        return { success: false, message: formatMongooseError(err), employee: null };
      }
    },

    
    updateEmployee: async (_, { eid, input }, context) => {
      requireAuth(context);

      if (input.salary !== undefined && input.salary < 1000) {
        return { success: false, message: "salary must be >= 1000", employee: null };
      }

      try {
     
        if (input.email) {
          const duplicate = await Employee.findOne({ email: input.email, _id: { $ne: eid } });
          if (duplicate) {
            return { success: false, message: "Employee email already exists", employee: null };
          }
        }

        const employee = await Employee.findByIdAndUpdate(eid, input, {
          new: true,
          runValidators: true, 
        });

        if (!employee) {
          return { success: false, message: "Employee not found", employee: null };
        }

        return { success: true, message: "Employee updated", employee };
      } catch (err) {
        return { success: false, message: formatMongooseError(err), employee: null };
      }
    },

    
    deleteEmployee: async (_, { eid }, context) => {
      requireAuth(context);

      try {
        const deleted = await Employee.findByIdAndDelete(eid);
        if (!deleted) {
          return { success: false, message: "Employee not found" };
        }
        return { success: true, message: "Employee deleted" };
      } catch (err) {
        return { success: false, message: formatMongooseError(err) };
      }
    },
  },
};
