// Get the list of departments when loading
$(document).ready(function () {
    $.get('/departments')
        .done(function (data) {
            var departments = JSON.parse(data);
            departments.forEach(function (department) {
                addDepartmentItem(department);
            });           
        });
});

// Add a department
function addDepartment() {
    var newDepartmentName = $('#new-department').val();
    $.post('/department?name=' + newDepartmentName)
        .done(function (data) {
            addDepartmentItem(JSON.parse(data));
        });
}

// Delete a department
function deleteDepartment(departmentId) {
    $.ajax({
        url: '/department/' + departmentId,
        type: 'DELETE'
    })
        .done(function () {
            $('#department-' + departmentId).remove();
        });
}

// Create a debounced version of update
var debouncedUpdate = debounce(250, updateDepartment);
function onDepartmentChange(departmentId, departmentName) {    
    // Handle department change
    debouncedUpdate(departmentId, departmentName);
}

// Update a department
function updateDepartment(departmentId, departmentName) {
    $.post('/department/' + departmentId + '?name=' + departmentName);
}

// employee
function employeeItem(employee){
    employee = employee || {};
    var block = document.createElement('div');
    block.className = "employee-item"
     var imageDiv = document.createElement('div');
    block.appendChild(imageDiv);
    var imageBlock = document.createElement('img');
    imageDiv.appendChild(imageBlock);
    if (employee.imageUrl){
        imageBlock.src = employee.imageUrl;
    }

    var imageUrlLabel = document.createElement('label');
    imageUrlLabel.innerHTML = 'Image url';
    block.appendChild(imageUrlLabel);
   

    var imageUrl = document.createElement('input');
    $(imageUrl).change(function(){
        if ($.trim(this.value).length > 0){
            imageBlock.src = imageUrl.value;
        }
    });

    imageUrl.placeholder = 'Insert image url';
    imageUrl.value = employee.imageUrl || '';
    imageUrl.name = 'imageUrl';
    block.appendChild(imageUrl);

    var nameLabel = document.createElement('label');
    nameLabel.innerHTML = 'Name';
    block.appendChild(nameLabel);
    var name = document.createElement('input');
    name.placeholder = 'Enter employee name';
    name.name = 'name';
    name.value = employee.name || '';
    block.appendChild(name);

    var emailLabel = document.createElement('label');
    emailLabel.innerHTML = 'Email';
    block.appendChild(emailLabel);
    var email = document.createElement('input');
    email.placeholder = 'Insert employee\'s email';
    email.value = employee.email || '';
    email.name = 'email';

    block.appendChild(email);
    if (employee.id){
        var deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'remove';
        deleteBtn.onclick = function(){
            deleteEmployee(employee, function(){
                $(block).remove();
                block.onDelete();
            })
        }
        block.appendChild(deleteBtn);

        // Create a debounced version of update
        var debouncedEmployeeUpdate = debounce(250, updateEmployee);
        function onDepartmentEmployeeChange(employee) {    
        // Handle department change
            debouncedEmployeeUpdate(employee);
        }

        $(block).find('input').keyup(function(){
            employee[this.name] = this.value;
            updateEmployee(employee);
        });
        var number = document.createElement("div");
        number.innerHTML = "#"+employee.id;
        block.appendChild(number);
    }else{
        var save = document.createElement('button');
        save.innerHTML = 'create';
        save.onclick = function(){
            employee.imageUrl = imageUrl.value;    
            employee.email = email.value;
            employee.name = name.value;
            employee.departmentId = block.departmentId;
            addEmployee(employee, function(data){
                block.onSave(data);
                imageUrl.value = '';    
                email.value = '';
                name.value = '';
            });
        }
        block.appendChild(save);
        $(block).addClass('create');
    }

    block.onSave = function(data){}
    block.onDelete = function(){}
    return block;
}

function employessBlock(department){
    var employees = document.createElement('div');
    employees.departmentId = department.id;
    department.employees.forEach(function (employee) {
            employees.appendChild(employeeItem(employee));
        }); 
    var newEmployee = employeeItem();
    newEmployee.departmentId = department.id;
    newEmployee.onSave = function(data){
        var employeeNewBlock = employeeItem(data);
        employees.insertBefore(employeeNewBlock, newEmployee);
        employees.parentNode.style.maxHeight = employees.parentNode.scrollHeight + "px";
    }

    employees.appendChild(newEmployee);
    
    return employees;
}

// Add a employee
function addEmployee(employee, success) {
    $.ajax({
            url: '/department/add_employee',
            type: 'post',
            dataType: 'json',
            success: function (data) {
               success(data);
            },
            data: employee
        });
}

// Delete a employee
function deleteEmployee(employee, success) {
    $.ajax({
        url: '/department/delete_employee?departmentId=' + employee.departmentId+'&'+'employeeId='+employee.id,
        type: 'DELETE'
    })
        .done(function () {
            success();
        });
}

// update employee
function updateEmployee(employee){
    $.ajax({
            url: '/department/update_employee',
            type: 'post',
            dataType: 'json',
            data: employee
        });
}
// end employee


// Add a department to the departments list
function addDepartmentItem(department) {
    var departmentItem = '<li id="department-' + department.id + '">Id: ' + department.id + '&nbspName: ' + 
        '<input type="text" value="' + department.name + '">'+
        '&nbsp<button class="del">delete</button>' +
        '<div type="button" class="btn btn-info accordion" data-toggle="collapse" data-target="#department-employees-'+department.id+'">Manage employees</div>' +
        '<div id="department-employees-'+department.id+'" class="panel"></div>'+
        '</li>';
    $('#departments').append(departmentItem);
    // Handle onClick for the delete button
    $('#department-' + department.id + " button.del").click(deleteDepartment.bind(null, department.id));
    // Handle department name change
    $('#department-' + department.id + " input").keyup(function() {
        onDepartmentChange(department.id, this.value)
    });
    $('#department-employees-' + department.id).append(employessBlock(department));
    setAccordion();
}

// Debounce a function
function debounce(wait, func) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            func.apply(context, args);
        };       
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

function setAccordion(){
    var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].onclick = function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight){
  	  panel.style.maxHeight = null;
    } else {
  	  panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  }
}
}