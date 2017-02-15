var Employee = require('./employee');
var Department = require('./department');
var qs = require('querystring');

class DepartmentManager {
    constructor(server) {
        this.departments = [];
        // Register department handlers
        server.use('POST', /^\/department\?name=(.*)$/, (req, res, params) => this.handleNew(req, res, params));
        server.use('GET', /^\/departments$/, (req, res, params) => this.handleList(req, res, params));
        server.use('GET', /^\/department\/([\d*])$/, (req, res, params) => this.handleGet(req, res, params));
        server.use('DELETE', /^\/department\/([\d*])$/, (req, res, params) => this.handleDelete(req, res, params));
        server.use('POST', /^\/department\/([\d*])\?name=(.*)$/, (req, res, params) => this.handleUpdate(req, res, params));
        server.use('POST', /^\/department\/add_employee$/, (req, res, params) => this.postCall(req, res, this.handleAddEmployee));
        server.use('POST', /^\/department\/update_employee$/, (req, res, params) => this.postCall(req, res, this.handleUpdateEmployee));
        server.use('DELETE', /^\/department\/delete_employee\?departmentId=(.*)&employeeId=(.*)$/, (req, res, params) => this.handleDeleteEmployee(req, res, params));
    }

    // Add a new deprtmpent
    handleNew(req, res, params) {
        var department = new Department({ id: this.departments.length + 1, name: unescape(params[0]) })
        this.departments.push(department);
        res.write(JSON.stringify(this.departments[this.departments.length - 1]));
        res.end();
    }

    // Get a list of all deprtmpents
    handleList(req, res, params) {
        res.write(JSON.stringify(this.departments));
        res.end();
    }

    // Get a single department
    handleGet(req, res, params) {
        var department = this._getDepartment(params[0], res);
        if (!department) {
            return;
        }
        res.write(JSON.stringify(department));
        res.end();
    }

    // Delete a department
    handleDelete(req, res, params) {
        var department = this._getDepartment(params[0], res);
        if (!department) {
            return;
        }
        this.departments = this.departments.filter(dept => dept.id != department.id);
        res.end();
    }

    // Update a department
    handleUpdate(req, res, params) {
        var department = this._getDepartment(params[0], res);
        if (!department) {
            return;
        }
        this.departments = this.departments.map(dept => {
            return dept.id != department.id ? dept : new Department({ id: dept.id, name: unescape(params[1]), emplyees: dept.emplyees}) ;
        });
        res.write(JSON.stringify(this.departments.find(dept => dept.id === department.id)));
        res.end();
    }

    postCall(req, res, next){
        var body = '';
        var parameters = {};
        var self = this;
        req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                req.connection.destroy();
        });
        
        req.on('end', function () {
            parameters = qs.parse(body);
            next.call(self, req, res, parameters); 
        });
    }
    
    // Add employee to department
    handleAddEmployee(req, res, params) {     
        var department = this._getDepartment(params['departmentId'], res);
        var result = {};
        if (!department ) {
            return;
        }else{
           var employee = new Employee({
               name: params['name'], 
               email: params['email'], 
               imageUrl: params['imageUrl'],
               departmentId: params['departmentId'],
               id: department.employees.length + 1});
           department.addEmployee(employee);
           result = employee;
        }

        res.write(JSON.stringify(result));
        res.end();
    }

     handleUpdateEmployee(req, res, params) {     
        var department = this._getDepartment(params['departmentId'], res);
        var result = {};
        if (!department ) {
            return;
        }else{
          var existsEmployee = department.findEmployeeById(params['id']);

          if (!existsEmployee){
              res.writeHead(404, 'Not found');
              res.end()
              return null;
          }

          var employee = new Employee({
               name: params['name'], 
               email: params['email'], 
               imageUrl: params['imageUrl'],
               departmentId: existsEmployee.departmentId,
               id: existsEmployee.id});
          
           department.updateEmployee(employee);
           result = employee;
        }

        res.write(JSON.stringify(result));
        res.end();
    }

    handleDeleteEmployee(req, res, params){
         var department = this._getDepartment(params[0], res);
        var result = {};
        if (!department ) {
            return;
        }
        
        department.deleteEmployeeById(params[1]);

        res.write(JSON.stringify(department));
        res.end();
    }

    // Find a department by its ID string
    _getDepartment(deparmentIdStr, res) {
        var departmentId = parseInt(deparmentIdStr);
        var department = this.departments.find(dept => dept.id === departmentId);
        if (!department) {
            res.writeHead(404, 'Not found');
            res.end()
            return null;
        }
        return department;
    }

}

module.exports = DepartmentManager;
