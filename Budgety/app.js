var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (incomeTotal) {

        if (incomeTotal > 0) {
            this.percentage = Math.round((this.value / incomeTotal) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.returnPercentage = function () {
        return this.percentage;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {
            var newItem, id;
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            //create new item based on inc or exp
            if (type === "exp") {
                newItem = new Expense(id, des, val);
            } else if (type === "inc") {
                newItem = new Income(id, des, val);
            }

            //push to datastructure
            data.allItems[type].push(newItem);

            //return newItem
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            //calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate budget : total income - total expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income spent


            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            })

        },
        getPercentage: function () {
            var perc = data.allItems.exp.map(function (cur) {
                return cur.returnPercentage();
            });
            return perc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data);
        }

    };

})();


var UIController = (function () {

    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetValue: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expPercentLabel: ".item__percentage",
        monthLabel: ".budget__title--month"

    };

    var formatNumber = function (num, type) {

        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, int.length);
        }

        return (type === "inc" ? "+" : "-") + " " + int + "." + dec;

    };
    return {
        getInput: function () {

            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            //HTML string with placeholder text
            if (type === "inc") {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace placeholder with actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

            //insert the HTML to DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);


        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentElement.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            for (var i = 0; i < fieldsArr.length; i++) {
                fieldsArr[i].value = "";
            }
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {

            obj.budget >= 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "--"
            }

        },

        //with the help of own for each
        displayPercentages: function (percentage) {
            var fields = document.querySelectorAll(DOMStrings.expPercentLabel);

            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function (current, index) {


                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + "%";
                } else {
                    current.textContent = "--";
                }

            });
        },

        //using the slice method from array prototype
        displayPercentageSlice: function (percentage) {

            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.expPercentLabel);
            fieldsArr = Array.prototype.slice.call(fields);
            //console.log(fieldsArr);

            for (var i = 0; i < fieldsArr.length; i++) {

                if (percentage[i] > 0) {
                    fieldsArr[i].textContent = percentage[i] + "%";
                } else {
                    fieldsArr[i].textContent = "--";
                }
            }

        },

        displayMonth: function () {
            //var NowMoment = moment();
            var date = moment().format("MMMM YY");
            document.querySelector(DOMStrings.monthLabel).textContent = date;

        },

        typeChangeColor: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(
                DOMStrings.inputType + "," +
                DOMStrings.inputDescription + "," +
                DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            for (var i = 0; i < fieldsArr.length; i++) {
                fieldsArr[i].classList.toggle("red-focus");
            }
            document.querySelector(DOMStrings.inputButton).classList.toggle("red");

        },
        getDomStrings: function () {
            return DOMStrings;

        }

    };


})();


var controller = (function (budgetctrl, uictrl) {

    var setupEventListeners = function () {
        var DOM = uictrl.getDomStrings();
        document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener("click", cntrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change", uictrl.typeChangeColor);
    };

    var budgetCalculation = function () {
        //1 calculate the budget
        budgetctrl.calculateBudget();

        //2 return the calculated budget
        var budget = budgetctrl.getBudget();
        //3 display the budget to UI
        //console.log(budget);
        UIController.displayBudget(budget);
    };

    var updatePercentage = function () {

        //calculate the percentage in budget controller
        budgetctrl.calculatePercentage();

        //get the updated percentages
        var expPerc = budgetctrl.getPercentage();

        //update the UI with updated percentages
        //uictrl.displayPercentages(expPerc);
        uictrl.displayPercentageSlice(expPerc);
        console.log(expPerc);

    };
    var ctrlAddItem = function () {
        var input, newItem;

        //1 Get the field input data
        input = uictrl.getInput();

        if (input.description != "" && !isNaN(input.value) && input.value > 0) {

            //2 Add item into budget controller
            newItem = budgetctrl.addItem(input.type, input.description, input.value);

            //3 Add the item to UI
            uictrl.addListItem(newItem, input.type);

            //4 clear fields
            uictrl.clearFields();

            //5 budget calculation and display to UI
            budgetCalculation();


            //6 expense percentages calculation
            updatePercentage();

        }
    };

    var cntrlDeleteItem = function (event) {
        var itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(itemID);

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            //delete the item from data structure
            budgetctrl.deleteItem(type, id);

            //delete item from UI
            uictrl.deleteListItem(itemID);

            //update the budget
            budgetCalculation();

            //6 expense percentages calculation
            updatePercentage();
        }
    };

    return {
        init: function () {
            console.log("App has started");
            uictrl.displayMonth();
            uictrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    }
})(budgetController, UIController);

controller.init();
