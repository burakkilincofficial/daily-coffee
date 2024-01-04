import "./styles.css";
import React, { useState } from "react";
import "./App.css";

function App() {
  const initialEmployees = JSON.parse(localStorage.getItem("employees")) || [
    { id: 1, name: "Atakan", coffeeCount: 0, canTakeCoffee: true },
    { id: 2, name: "Emrah", coffeeCount: 0, canTakeCoffee: true },
    { id: 3, name: "Burak K.", coffeeCount: 0, canTakeCoffee: true },
    { id: 4, name: "Irem", coffeeCount: 0, canTakeCoffee: true },
    { id: 5, name: "Akin", coffeeCount: 0, canTakeCoffee: true },
    { id: 6, name: "Nilgun", coffeeCount: 0, canTakeCoffee: true },
    { id: 7, name: "Nazli", coffeeCount: 0, canTakeCoffee: true },
    { id: 8, name: "Ebubekir", coffeeCount: 0, canTakeCoffee: true },
    { id: 9, name: "Batikan", coffeeCount: 0, canTakeCoffee: true },
    { id: 10, name: "Hayat", coffeeCount: 0, canTakeCoffee: true },
    { id: 11, name: "Omer", coffeeCount: 0, canTakeCoffee: true },
    { id: 12, name: "Egehan", coffeeCount: 0, canTakeCoffee: true },
    { id: 13, name: "Burak A.", coffeeCount: 0, canTakeCoffee: true },
  ];

  initialEmployees.sort((a, b) => a.name.localeCompare(b.name));

  const [employees, setEmployees] = useState(initialEmployees);

  const handleCoffeeClick = (id) => {
    const today = new Date().toDateString();
    const employeeIndex = employees.findIndex((employee) => employee.id === id);
    const selectedEmployee = employees[employeeIndex];

    if (selectedEmployee.lastCoffeeDate === today) {
      alert(`${selectedEmployee.name}, bugün zaten kahve cezanı aldın! ☕`);
      return;
    }

    const updatedEmployees = [...employees];
    updatedEmployees[employeeIndex] = {
      ...selectedEmployee,
      coffeeCount: selectedEmployee.coffeeCount + 20,
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
          <div key={employee.id} className={`employee-card ${employee.coffeeCount !== 0 ? 'one-coffee' : ''}`}
          >
            <h2>{employee.name}</h2>
            <button onClick={() => handleCoffeeClick(employee.id)}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Coffee_cup_icon.svg/2137px-Coffee_cup_icon.svg.png"
                alt="Kahve"
                width="50"
              />
            </button>
             {employee.coffeeCount > 0 && <p>{employee.coffeeCount} TL</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
