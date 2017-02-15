class Employee{
    constructor(data){
        this.name = data['name'];
        this.email = data['email'];
        this.status = new Status();
    }
}

class Status {
    constructor(message, isFailed){
       this.message = "";
        this.isSuccess = false;
    }
}

class EmployeesManager {
    constructor(){
        this.Employees = {};
    }

    createEmployee(EmployeeData){
        var employee = new Employee(EmployeeData);
        // if (this.Employees[employee.email]){
        //     employee.status = new Status("employess with the same email already exists", false);
        // }else{
            this.Employees[employee.email] = employee;
     //   }
        return employee;
    }
}

module.exports = DepartmentManager;
