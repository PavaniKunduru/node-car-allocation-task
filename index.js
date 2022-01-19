function main() {
  const employees = [];
  const cabs = [];
  const argv = process.argv.slice(2);

  if (+argv[0] < +argv[1]) {
    console.log(
      "No of employees in the organization should always be greater than the number of cabs hired by the organization."
    );
    process.exit(1);
  }

  function intializeObjects() {
    // initalizing emplyoees
    for (let index = 0; index < +argv[0]; index++) {
      employees.push({
        id: index + 1,
        isCabBooked: false,
        cabId: null,
      });
    }

    // initalizing cabs
    for (let index = 0; index < +argv[1]; index++) {
      cabs.push({
        id: index + 1,
        isCabAvailable: true,
      });
    }
  }

  async function processRequest() {
    const totalTests = argv.slice(2).length;
    for (let index = 0; index < totalTests; index++) {
      if (!checkCabAvailable()) {
        console.log("** No cabs available at the moment. Please wait... **");
        await waitForAvailablity();
      }
      const testCase = argv[index + 2];
      const data = convertStringToObject(testCase);
      if (data.type == 1) {
        requestbooking(data);
      } else {
        bookingStatus(data, (type = "cancel"));
      }
      await delay(500);
    }
  }

  function convertStringToObject(value) {
    const elements = value.split(" ");
    const data = {
      empId: +elements[0],
      slot: +elements[1],
      type: +elements[2],
    };
    return data;
  }

  function checkCabAvailable() {
    const result = cabs.findIndex((cab) => cab.isCabAvailable == true);
    return result >= 0 ? true : false;
  }

  function waitForAvailablity() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (checkCabAvailable()) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  function checkSlotAvailablity(slot) {
    const totalCabs = cabs.length;
    const totalCabBooked = cabs.reduce((sum, cab) => {
      if (cab.isCabAvailable == false && cab.slot == slot) {
        sum++;
      }
      return sum;
    }, 0);

    return totalCabBooked <= Math.floor(totalCabs / 2);
  }

  function requestbooking(data) {
    if (!checkSlotAvailablity(data.slot)) {
      console.log(
        `** Sorry cannot allocate for slot ${data.slot} at the moment. Please check different slot or try later **`
      );
      return;
    }

    const emp = employees.find((emp) => emp.id == data.empId);

    // Block emplyoee if he has booked & canceled the cab for 2 times
    if (emp.totalBookingCanceled == 2) {
      console.log(
        `Employee-${emp.id} has been blocked to book the cab for 7s.`
      );
      blockEmployee(emp);
      return;
    }

    // Checking if the emplyoee already has a ongoing booking
    if (emp.isCabBooked) {
      console.log(
        `emp-${emp.id} has already booked the cab for slot-${emp.slot}.`
      );
      return;
    }
    emp.isCabBooked = true;
    emp.slot = data.slot;

    const cab = cabs.find((ele) => ele.isCabAvailable == true);
    cab.isCabAvailable = false;
    cab.slot = data.slot;

    emp.cabId = cab.id;
    console.log(
      `Cab-${emp.cabId} allocate to Emp-${emp.id} for slot-${emp.slot}`
    );

    // Booking finished after 5 seconds
    setTimeout(() => {
      bookingStatus(data, "finished");
    }, 5000);
  }

  function bookingStatus(data, type) {
    const emp = employees.find((emp) => emp.id == data.empId);
    emp.isCabBooked = false;
    emp.totalBookingCanceled = ++emp.totalBookingCanceled || 1;
    const cabId = emp.cabId;
    emp.cabId = null;

    if (!cabId) return;

    const cab = cabs.find((ele) => ele.id == cabId);
    cab.isCabAvailable = true;

    if (type == "cancel") {
      console.log(
        `Booking for slot-${emp.slot}  cancelled by Emp-${emp.id}  `
      );
    } else if (type == "finished") {
      console.log(
        `Cab-${cabId} added back to the pool`
      );
    }
  }

  async function blockEmployee(emp) {
    await delay(7000);
    emp.totalBookingCanceled = 0;
  }

  function delay(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  intializeObjects();
  processRequest();
}

main();
