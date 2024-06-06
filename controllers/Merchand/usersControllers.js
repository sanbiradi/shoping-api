const Merchand = require("../../models/Merchand");
const AdminUsers = require("../../models/AdminUsers");
const bcrypt = require("bcrypt");
const {validatePassword}  =require("../ValidatePassword")

async function udapteOrgName(req, res) {
  const { email, name } = req.body;
  const id = req.id;

  if (!req.body) {
    return res.status(403).json({
      error: "'email' and field must be in the body of request!",
    });
  }

  if (!email) {
    return res.status(401).json({ error: "'email' field is required!" });
  }

  if (!name) {
    return res.status(401).json({ error: "'name' field is required!" });
  }

  if (id) {
    const details = await Merchand.findOne({ _id: id });
    details.companyName = name;
    details.save();
    res
      .status(200)
      .json({ message: "company name is updated successfully!", details });
  }
}

async function createUser(req, res) {
  const { email, name, password, role } = req.body;
  const id = req.id;

  if (!req.body) {
    return res.status(403).json({
      error: "'email' and field must be in the body of request!",
    });
  }

  if (!email) {
    return res.status(401).json({ error: "'email' field is required!" });
  }

  if (!name) {
    return res.status(401).json({ error: "'name' field is required!" });
  }

  if (!password) {
    return res.status(401).json({ error: "'password' field is required!" });
  }

  if (!role) {
    return res.status(401).json({ error: "'role' field is required!" });
  }

  if (id) {
    const details = await Merchand.findOne({ _id: id });
    const existUser = await AdminUsers.findOne({ email });

    if (existUser) {
      return res
        .status(403)
        .json({ code: "403", message: "User exists with this email." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new AdminUsers({
      email,
      name,
      role,
      picture: "https://i.imgur.com/CR1iy7U.png",
      deleted: false,
      password: passwordHash,
      isEmailVerified: false,
    });

    newUser.save().then((user) => {
      const userDetails = {
        _id: user._id,
        name: user.name,
        email: user.email,
        companyName: details.companyName,
        picture: "https://i.imgur.com/CR1iy7U.png",
        deleted: false,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      details.AdminUsers.push(user._id);
      details.save();

      return res.status(200).json({
        message: `User created successfully ${details.companyName}`,
        userDetails,
      });
    });
  }
}

async function updateUserRole(req, res) {
  const userId = req.params.id;
  const { role } = req.body;
  const id = req.id;

  if (!req.body) {
    return res.status(403).json({
      error: "'email' and field must be in the body of request!",
    });
  }

  if (!role) {
    return res.status(401).json({ error: "'role' field is required!" });
  }
  const details = await Merchand.findOne({ _id: id });
  const isUserExist = await AdminUsers.findOne({ _id: userId });
  if (!isUserExist) {
    return res
      .status(403)
      .json({ code: "403", Message: "user does not exist in this company" });
  }

  isUserExist.role = role;
  isUserExist.save().then((user) => {
    const userDetails = {
      _id: user._id,
      name: user.name,
      email: user.email,
      companyName: details.companyName,
      picture: "https://i.imgur.com/CR1iy7U.png",
      deleted: false,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return res.status(200).json({
      code: "200",
      userDetails,
      message: "User role has been updated successfully!",
    });
  });
}

async function deleteUser(req, res) {
  const userId = req.params.id;
  const id = req.id;

  if (!userId) {
    return res.status(401).json({ error: "please provide user id" });
  }
  const details = await Merchand.findOne({ _id: id });
  const isUserExist = await AdminUsers.findOne({ _id: userId });

  if (isUserExist.deleted) {
    return res
      .status(403)
      .json({ code: "403", Message: "user does not exist in this company" });
  }

  isUserExist.deleted = true;
  isUserExist.save().then((user) => {
    return res.status(200).json({
      code: "200",
      message: "User has been deleted successfully!",
    });
  });
}

async function getUsers(req, res) {
  const id = req.id;
  const merchandData = await Merchand.findOne({ _id: id });
  const ids = [...merchandData.AdminUsers];
  const { name, role, sortBy, limit, page } = req.body;
  try {
    const users = await AdminUsers.find({ _id: { $in: ids } });
    return res.status(200).json({
      users,
      name: name || "",
      role: role || "",
      sortBy: sortBy || "",
      limit: limit || 10,
      page: page || 1,
    });
  } catch (error) {
    return res
      .status(403)
      .json({ error: "Failed to fetch users", ids, filters });
  }
}

async function changePasswordUser(req, res) {
  const id = req.id;
  const { old_password, new_password } = req.body;

  if (!req.body) {
    return res.status(403).json({
      code: "403",
      error:
        "'new_password' and 'new_password' fields must be in the body of request!",
    });
  }

  if (!old_password) {
    return res.status(401).json({ error: "'old_password' field is required!" });
  }

  if (!new_password) {
    return res.status(401).json({ error: "'new_password' field is required!" });
  }

  let existAdmin = await Merchand.findOne({ _id: id });
  let chooseDocument = existAdmin;
  let user;

  if (!existAdmin) {
    user = await AdminUsers.findOne({ _id: id });
    chooseDocument = user;
  }

  if (!chooseDocument) {
    return res.status(403).json({ error: "user does not exist", code: "403" });
  }


  const matchedPassword = await bcrypt.compare(old_password,chooseDocument.password)

  if (!matchedPassword) {
    return res.status(401).json({
      error: "'old_password' is wrong password does not matched! provide correct",
    });
  }

  const checknewPassword = validatePassword(new_password);
  if (checknewPassword !== true) {
    return res
      .status(401)
      .json({ code: "401", message: `${checknewPassword}` });
  }

  const new_passwordHash = await bcrypt.hash(new_password, 10);
  chooseDocument.password = new_passwordHash;

  chooseDocument.save().then((user) => {
    return res.status(200).json({
      code: "200",
      message: "Password has changed successfully!",
    });
  });
}

module.exports = {
  udapteOrgName,
  updateUserRole,
  createUser,
  deleteUser,
  getUsers,
  changePasswordUser,
};
