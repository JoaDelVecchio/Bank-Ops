'use strict';

// Datos
const account1 = {
  username: 'jdv',
  owner: 'Joaquin Del Vecchio',
  movements: [2000.1352, 4500, -4000.12, 3000, -6500, 13000, -700.55, 1500],
  interestRate: 1.2, //% 
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2021-04-10T14:11:59.604Z',
    '2021-07-26T17:01:17.194Z',
    '2022-04-15T23:36:17.929Z',
    '2022-04-17T10:51:36.790Z',
  ],
  currency: 'ARS',
};

const account2 = {
  username: 'ng',
  owner: 'Nicolas Gonzalez',
  movements: [7550, 2000, -1520.3, -1990, 4410, 5000, 650, -3000],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'ARS',
};

const account3 = {
  username: 'jp',
  owner: 'Juan Pérez ',
  movements: [5000, 3400, -150, -790, -3210, -1000, 400, -30],
  interestRate: 1.8,
  pin: 3333,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'ARS',
};

const accounts = [account1, account2, account3];

// DOM
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const incorrectLogIn = document.querySelector('.incorrectLogIn');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// INICIALIZACIONES Y DECLARACIONES DE VARIABLES

let currentAcount,
  timer,
  sorted = false;
let today = new Date();
containerMovements.innerHTML = '';

/////////////////////////////////////////////////
//FUNCTIONS

//FECHAS Y HORARIOS

const getDayMonthYearHourMinuteSecond = (date) => {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, 0),
    `${date.getDate()}`.padStart(2, 0),
    `${date.getHours()}`.padStart(2, 0),
    `${date.getMinutes()}`.padStart(2, 0),
    `${date.getSeconds()}`.padStart(2, 0),
  ];
};

const refreshDate = () => {
  today = new Date();
  let year, month, day, hour, minute, second;
  [year, month, day, hour, minute, second] =
    getDayMonthYearHourMinuteSecond(today);
  labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;
};
refreshDate();
setInterval(refreshDate, 1000);

const calcDayPassed = (date1, date2) =>
  Math.floor(Math.abs(date2 - date1) / (1000 * 3600 * 24));
///////////////////////////////////
//MUESTRO EN PANTALLA LAS OPERACIONES DE LA CUENTA

const displayMovements = function (acc, sorted = false) {
  const movs = sorted
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach((mov, i) => {
    const [year, month, day] = getDayMonthYearHourMinuteSecond(
      new Date(acc.movementsDates[i])
    );
    const daysPassed = calcDayPassed(
      new Date(),
      new Date(acc.movementsDates[i])
    );
    const date =
      daysPassed == 0
        ? 'Hoy'
        : daysPassed == 1
        ? 'Ayer'
        : daysPassed <= 7
        ? `hace ${daysPassed} días`
        : `${year}/${month}/${day}`;

    const operation = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${operation}">${operation == 'deposit'? 'deposito' : 'retiro'} ${
      i + 1
    }</div>
    <div class="movements__date">${date}</div>
    <div class="movements__value">${mov.toFixed(2)} ${acc.currency}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/////////////////////////////////////////////
//CALCULO Y MUESTRA EN PANTALLA DE BALANCE Y RESUMEN

const calculateBalance = function (acc) {
  return acc.movements.reduce((balance, mov) => balance + mov, 0);
};
const calculateSummary = function (acc) {
  let incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acum, mov) => acum + mov);
  let outcomes = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acum, mov) => acum + mov);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((mov) => (mov * acc.interestRate) / 100)
    .reduce((acc, interest) => acc + interest, 0);

  return [incomes, outcomes, interest];
};

const displayBalance = function (acc, balance) {
  labelBalance.textContent = `${balance.toFixed(2)} ${acc.currency}`;
};

const displaySummary = function (acc, incomes, outcomes, interest) {
  labelSumInterest.textContent = `${interest.toFixed(2)} ${acc.currency}`;
  labelSumIn.textContent = `${incomes.toFixed(2)} ${acc.currency}`;
  labelSumOut.textContent = `${Math.abs(outcomes).toFixed(2)} ${acc.currency}`;
};

const updateDisplay = function (acc) {
  displayMovements(acc);
  displayBalance(acc, calculateBalance(acc));
  displaySummary(acc, ...calculateSummary(acc));
};

////////////////////////////////////////////
//TEMPORIZADOR PARA CERRAR SESION

const startLogOutTimer = function () {
  let time = 300;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Inicia sesion para comenzar';
      containerApp.style.opacity = 0;
    }

    time--;
  };

  tick();
  timer = setInterval(tick, 1000);
  return timer;
};

/////////////////////////////
//FUNCION DE LOGEO

const logIn = function () {
  currentAcount = accounts.find(
    (acc) =>
      acc.username == inputLoginUsername.value && acc.pin == inputLoginPin.value
  );

  //Si los datos ingresados coinciden con una cuenta existente se muestran los datos de la misma

  if (currentAcount) {
    incorrectLogIn.textContent = '';
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Bienvenido, ${currentAcount.owner}!`;
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    updateDisplay(currentAcount);
    clearTimeout(timer);
    timer = startLogOutTimer();
  } else {
    incorrectLogIn.textContent = 'Usuario o contraseña incorrectos';
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
  }
};

/////////////////////////////
//FUNCION PARA TRANSFERIR DINERO

const transferMoney = function () {
  const amount = +inputTransferAmount.value;
  const recieverAccount = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  //Se verifica que la persona que quiere transferir cuente con el dinero necesario en su cuenta y que la cuenta a la que se quiere transferir exista. De ser asi, se realiza la transferencia y se actualizan los datos.

  if (
    recieverAccount &&
    amount <= calculateBalance(currentAcount) &&
    amount > 0
  ) {
    currentAcount.movements.push(-amount);
    recieverAccount.movements.push(amount);
    currentAcount.movementsDates.push(today);
    recieverAccount.movementsDates.push(today);
    updateDisplay(currentAcount);

    //Reinicio el temporizador
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputTransferAmount.value = inputTransferTo.value = '';
};

/////////////////////////////
//FUNCION PARA PEDIR PRESTAMO

const getLoan = function () {
  const loanAmount = Math.floor(inputLoanAmount.value);

  //Se comprueba si el usuario ya hizo algun deposito mayor al 10% que pide como prestamo.
  if (
    loanAmount > 0 &&
    currentAcount.movements.some((mov) => mov > loanAmount * 0.1)
  ) {
    currentAcount.movements.push(loanAmount);
    currentAcount.movementsDates.push(today);
    updateDisplay(currentAcount);
    //Reinicio el temporizador
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
};

/////////////////////////////
//FUNCTION PARA CERRAR CUENTA

const closeAccount = function () {
  if (
    inputCloseUsername.value === currentAcount.username &&
    +inputClosePin.value === currentAcount.pin
  ) {
    accounts.splice(accounts.indexOf(currentAcount), 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Inicia sesion para comenzar";
  }
  inputCloseUsername.value = inputClosePin.value = '';
  clearInterval(timer);
};

/////////////////////////////
//PROGRAMA
//////////////////////////////

//Cuando se presiona enter o el boton para loguearse se anula el efecto de recargar pagina del boton por estar en un form y se activa la funcion logIn

btnLogin.addEventListener('click', (e) => {
  e.preventDefault();
  logIn();
});

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();
  transferMoney();
});

btnLoan.addEventListener('click', (e) => {
  e.preventDefault();
  getLoan();
});

btnClose.addEventListener('click', (e) => {
  e.preventDefault();
  closeAccount();
});

btnSort.addEventListener('click', function () {
  containerMovements.innerHTML = '';
  displayMovements(currentAcount, !sorted);
  sorted = !sorted;
});
