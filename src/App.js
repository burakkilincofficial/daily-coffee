import "./styles.css";
import React, { useState } from "react";
import "./App.css";

function App() {
  const initialEmployees = JSON.parse(localStorage.getItem("employees")) || [
    { id: 1, name: "Atakan", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 2, name: "Emrah", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 3, name: "Burak K.", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 4, name: "Irem", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 5, name: "Akin", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 6, name: "Nilgun", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 7, name: "Nazli", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 8, name: "Ebubekir", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 9, name: "Batikan", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 10, name: "Hayat", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 11, name: "Omer", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 12, name: "Egehan", totalCoffeMoney: 0, canTakeCoffee: true },
    { id: 13, name: "Burak A.", totalCoffeMoney: 0, canTakeCoffee: true },
  ];

  initialEmployees.sort((a, b) => a.name.localeCompare(b.name));

  const [employees, setEmployees] = useState(initialEmployees);

  const handleCoffeeClick = (id) => {
    const today = new Date().toDateString();
    const employeeIndex = employees.findIndex((employee) => employee.id === id);
    const selectedEmployee = employees[employeeIndex];

    if (selectedEmployee.lastCoffeeDate === today) {
      alert(`${selectedEmployee.name}, bugün zaten kahve cezani aldin! ☕`);
      return;
    }

    const updatedEmployees = [...employees];
    updatedEmployees[employeeIndex] = {
      ...selectedEmployee,
      totalCoffeMoney: selectedEmployee.totalCoffeMoney + 20,
      lastCoffeeDate: today,
    };

    setEmployees(updatedEmployees);
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
  };

  return (
    <div className="App">
      <h1>Daily Coffee</h1>
      <div className="employee-list">
        {employees.map((employee) => (
          <div key={employee.id} className={`employee-card ${employee.totalCoffeMoney !== 0 ? 'one-coffee' : ''}`}
          >
            <h2>{employee.name}</h2>
            <button onClick={() => handleCoffeeClick(employee.id)}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Coffee_cup_icon.svg/2137px-Coffee_cup_icon.svg.png"
                alt="Kahve"
                width="50"
              />
            </button>
             {employee.totalCoffeMoney > 0 && <p>{employee.totalCoffeMoney} TL</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
