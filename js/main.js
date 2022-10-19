window.onload = () => {
  const time = document.querySelector("#time");
  const route = document.querySelector("#route");
  const count = document.querySelector("#num");
  const btn = document.querySelector("button");

  // Корректируем расписание в зависимости от часового пояса, ориентир: UTC+3 Московское время
  const UTC3 = 3;
  const currUTC = new Date().getTimezoneOffset() / 60;
  const deffUTC = Math.abs(currUTC) - UTC3;

  // Заменяем на откоректированные значения
  [...time.children].forEach((item) => {
    item.value = Number(item.value.slice(0, 2)) + deffUTC + item.value.slice(2);
  });

  // устанавливаем значение по умолчанию
  time.value = [...time.children][0].value;

  let sum = 0;
  let price = 700;
  let countTicket = 0;
  let selectedRoute = route.value;
  let selectedTime = time.value;
  let travelTime = 50;

  function renderReturnRoutes() {
    const newElement = document.createElement("select");
    newElement.id = "SELECT";
    const list = makeTimeList();

    list.forEach((item) => {
      let opt = document.createElement("option");
      opt.innerHTML = item;
      newElement.append(opt);
    });

    time.after(newElement);
    const label = document.createElement("label");
    label.innerText = "Обратно";
    label.id = "LABEL_RENDER";
    newElement.before(label);
  }

  function removeReturnRoutes() {
    if (time.nextElementSibling.id === "LABEL_RENDER") {
      time.nextElementSibling.remove();
      time.nextElementSibling.remove();
    }
  }

  function makeTimeList() {
    return [...time.children]
      .filter((item) => item.value.slice(6, -1) === "из B в A")
      .map((item) => item.value);
  }

  function hideExcessTimes() {
    const list = [...time.children];

    function showTimesForRoute(route) {
      list.forEach((item) => {
        const routeItem = item.value.slice(6, -1);

        if (routeItem === route) {
          item.style = "display: inline-block";
        }
      });
    }

    // Скрывает все значения select
    list.forEach((item) => (item.style = "display: none"));

    // Показывает нужные значения select
    if (selectedRoute === "из B в A") showTimesForRoute("из B в A");
    else showTimesForRoute("из A в B");

    // Устанавливает первое нужное значение в select
    time.value = list.find(
      (item) => item.style.display === "inline-block"
    )?.value;
  }

  hideExcessTimes();

  function defineTime(timing) {
    const hours = timing.slice(0, 2);
    const minutes = Number(timing.slice(3, 5));
    const timeForRoute = 50;
    const doneHours = Math.round((hours * 60 + minutes + timeForRoute) / 60);

    [...time.children]
      .filter((item) => item.style.display === "none")
      .find((item) => Number(item.value.slice(0, 2)) >= doneHours);
  }

  function calcSumAndTime() {
    if (selectedRoute === "из A в B и обратно в А") {
      price = 1200;
      travelTime = 100;
    } else {
      price = 700;
      travelTime = 50;
    }

    sum = price * countTicket;
  }

  function calcTravelTime(start, end) {
    const startMinutes =
      Number(start.slice(0, 2) * 60) + Number(start.slice(3, 5));
    const endMinutes = Number(end.slice(0, 2) * 60) + Number(end.slice(3, 5));

    return endMinutes - startMinutes;
  }

  route.addEventListener("change", (e) => {
    selectedRoute = e.target.value;
    if (selectedRoute === "из A в B и обратно в А") {
      renderReturnRoutes();
      calcTimeReturnRoute();
    } else removeReturnRoutes();
    hideExcessTimes();
  });

  time.addEventListener("change", (e) => {
    selectedTime = e.target.value;
    if (selectedRoute === "из A в B и обратно в А") {
      calcTimeReturnRoute();
    }
    defineTime(selectedTime);
  });

  count.addEventListener("change", (e) => {
    let num = Number(e.target.value.match(/^\d+$/));
    countTicket = num;
  });

  function calcTimeRange(timing, mins) {
    const hours = Number(timing.slice(0, 2));
    const minutes = Number(timing.slice(3, 5));
    const timeForRoute = mins;
    const h = Math.floor((minutes + timeForRoute) / 60);
    const resMinutes = (minutes + timeForRoute) % 60;
    const resHours = hours + h;

    return [resHours, resMinutes];
  }

  function calcTimeReturnRoute() {
    const timeArival = calcTimeRange(time.value, 50);
    const list = document.querySelector("#SELECT");

    [...list.children].forEach((item) => {
      // Время приезда
      const resH = timeArival[0];
      const resM = timeArival[1];

      let hideValue = false;

      // Текущее проверяемое значение времени
      const itemH = Number(item.value.slice(0, 2));
      const itemM = Number(item.value.slice(3, 5));

      // Проверка на пересечение времени
      // В двух случаях нам нужно скрывать текущее значение времени:
      // Это если проверяемый час меньше часа прибытия - однозначно скрываем
      // Либо часы равны, а проверяемые минуты меньше минут прибытия - тоже скрываем
      // В иных случаях часы не пересекутся (в задании ничего не сказано о том, когда время прибытия равно времени отправки,
      // таки образом будем считать, что можно успеть и прибыть и сразу-же отбыть в одно и то-же время)
      if (itemH < resH) hideValue = true;
      else if (itemH === resH && itemM < resM) hideValue = true;

      if (hideValue) item.style.display = "none";
      else item.style.display = "inline-block";

      // Учтанавливаем первое подходящее значение
      list.value = [...list.children].filter(
        (item) => item.style.display !== "none"
      )[0].value;
    });
  }

  btn.addEventListener("click", () => {
    calcSumAndTime();
    if (sum && countTicket) {
      // Текущее выбранное время, ибо при выборе нового маршрута SelectedTime не обновляется
      timeValue = time.value;

      let arivalTime = calcTimeRange(timeValue, 50);
      let finallyTime = calcTravelTime(
        timeValue,
        `${arivalTime[0]}:${arivalTime[1]}`
      );
      let addMassage = "прибудет";

      if (selectedRoute === "из A в B и обратно в А") {
        const endTime = document.querySelector("#SELECT").value;
        const t = calcTimeRange(endTime, 50);
        finallyTime = calcTravelTime(timeValue, `${t[0]}:${t[1]}`);
        arivalTime = calcTimeRange(timeValue, finallyTime);
        addMassage = "вернется в пункт A";
      }

      const departureHours = `${timeValue.slice(0, 2)} - ${timeValue.slice(
        3,
        5
      )}`;

      // Форматирование времени, дополнение нулем
      const messsMinutes =
        arivalTime[1] < 10 ? "0" + String(arivalTime[1]) : arivalTime[1];
      const messHours =
        arivalTime[0] < 10 ? "0" + String(arivalTime[0]) : arivalTime[0];

      const massage = `Вы выбрали ${countTicket} билет(-а, -ов) по маршруту ${selectedRoute} стоимостью ${sum}р.
        \nЭто путешествие займет у вас ${finallyTime} минут. 
        \nТеплоход отправляется в ${departureHours}, а ${addMassage} в ${messHours} - ${messsMinutes}.`;
      alert(massage);
    } else {
      alert("Вы не указали кол-во билетов");
    }
  });
};
