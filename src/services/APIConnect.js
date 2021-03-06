import axios from "axios";

// Create axios client, pre-configured with baseURL
export const APIConnect = axios.create({
  baseURL: "https://tranquil-coast-47648.herokuapp.com",
  //baseURL: "http://localhost:3000",

  timeout: 100000,
});

//Delete  headers authorizarion
export const DeleteUserToken = () => {
  delete APIConnect.defaults.headers.common["Authorization"];
};

// Set  Token in Authorization to be included in all calls
export const SetUserToken = (token) => {
  APIConnect.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const Login = async (email, key) => {
  return await APIConnect.post("/login", {
    email,
    key,
  });
};

//check users by email, if email is null, show all users
export const UserEmail = async (email) => {
  return await APIConnect.get("/users/" + email);
};

export const Register = async ({
  name,
  email,
  phone,
  address,
  city,
  userType,
  key,
}) => {
  return await APIConnect.post("/register", {
    name,
    email,
    phone,
    address,
    city,
    userType,
    key,
  });
};

//only admin
export const GetUsers = async () => {
  return await APIConnect.get("/users/");
};

//only admin
export const GetVehicles = async (email) => {
  return await APIConnect.get("/vehicles/" + email);
};

// Get user's vehicles
export const GetUserVehicles = async (email) => {
  return await APIConnect.get("/users/" + email + "/vehicles");
};

// to capitalize the first letter of the string
const upperFirstLetter = (props) => {
  props = props.substr(0, 1).toUpperCase() + props.substr(1, props.length);
  return props;
};

// Add user vehicles
export const AddVehicles = async ({
  vin,
  type,
  make,
  model,
  engine,
  year,
  email,
}) => {
  model = model.toUpperCase();
  make = upperFirstLetter(make);
  return await APIConnect.post("/vehicles", {
    vin,
    type,
    make,
    model,
    engine,
    year,
    email,
  });
};
// Update user vehicle
export const UpdateVehicle = async ({
  vin,
  type,
  make,
  model,
  engine,
  year,
  email,
  id,
}) => {
  console.log(email);
  model = model.toUpperCase();
  make = upperFirstLetter(make);
  return await APIConnect.put("/users/" + email + "/vehicles/" + id, {
    vin,
    type,
    make,
    model,
    engine,
    year,
    email,
  });
};
// Delete user's vehicle
export const DeleteVehicle = async ({ email, vin }) => {
  console.log(email, vin);
  return await APIConnect.delete("/users/" + email + "/vehicles", {
    data: {
      vin: vin,
    },
  });
};

// Get parts
export const GetParts = async () => {
  return await APIConnect.get("/parts");
};
// Add parts
export const AddParts = async ({
  slug: slug,
  partName: partName,
  cost: cost,
  category: category,
  make: make,
  model: model,
}) => {
  return await APIConnect.post("/parts", {
    slug,
    partName,
    cost,
    category,
    make,
    model,
  });
};
// Update part
export const UpdatePart = async ({
  slug: slug,
  partName: partName,
  cost: cost,
  category: category,
  make: make,
  model: model,
}) => {
  model = model.toUpperCase();
  make = upperFirstLetter(make);
  return await APIConnect.put("/parts/" + slug, {
    slug,
    partName,
    cost,
    category,
    make,
    model,
  });
};
// Delete part
export const DeletePart = async ({ slug }) => {
  console.log(slug);
  return await APIConnect.delete("/parts/" + slug, {
    data: {
      slug: slug,
    },
  });
};

//get bookings
export const GetBookings = async () => {
  return await APIConnect.get("/users/service/bookings");
};
// Get services only admin
export const GetService = async () => {
  return await APIConnect.get("/service");
};
// Get service  by user
export const GetUserService = async (email) => {
  return await APIConnect.get("/users/" + email + "/service");
};

// Add service
export const AddService = async ({
  vin: vin,

  description: description,
  serviceType: serviceType,
  date_in: date_in,
}) => {
  let status = "Booked";
  return await APIConnect.post("/service", {
    vin,
    status,
    description,
    serviceType,
    date_in,
  });
};
// Update user service
export const UpdateService = async ({
  email,
  vin,
  description,
  serviceType,
  date_in,
  serviceId,
}) => {
  let status = "Booked";
  return await APIConnect.put("/users/" + email + "/service/" + serviceId, {
    vin,
    status,
    description,
    serviceType,
    date_in,
  });
};
// Update user service (ADM)
export const UpdateStatusService = async ({
  email,
  serviceId,
  status,
  description,
  serviceType,
  date_in,
  staff,
  vin,
}) => {
  return await APIConnect.put(
    "/users/" + email + "/service/" + serviceId + "/" + status,
    { vin, description, serviceType, date_in, staff }
  );
};

// Delete service
export const DeleteService = async ({ serviceId, email }) => {
  console.log(serviceId);
  return await APIConnect.delete("/users/" + email + "/service/" + serviceId, {
    data: {
      serviceId: serviceId,
    },
  });
};

export default APIConnect;
