import IDate from "../../types/IDate";
import IHour from "../../types/IHour";
import Day from "../Day/Day";
import "./Schedule.css";
import { useEffect, useRef, useState } from "react";

export default function Schedule() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dates, setDates] = useState<IDate[]>([]);
  const [isAutocompleteClicked, setIsAutocompleteClicked] = useState(false);
  const [isAutocompleteHovered, setIsAutocompleteHovered] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [clickCounter, setClickCounter] = useState(1);

  const maxCount = Math.floor(dates.length / 7);

  const containerRef = useRef(null);
  const elementsRef = useRef<HTMLLIElement[]>([]);

  const handleUpload = () => {
    const datesJSON = JSON.stringify(dates);
    console.log(datesJSON);
    handleReset();
  };

  const handleRef = (index: number) => (el: HTMLLIElement | null) => {
    if (el) {
      elementsRef.current[index] = el;
    }
  };

  const scrollToElement = (index: number) => {
    if (elementsRef.current[index]) {
      elementsRef.current[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  };

  const allDatesHaveHours = dates.length > 0 && dates.every((date) => date.hours.length > 0);
  
  const noneDatesHaveHours = dates.every((date) => date.hours.length === 0);

  const getDayAfterDate = (i: number) => {
    if (startDate !== "") {
      return new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
    }
    return "";
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (endDate !== "") {
      const newEndDate = new Date(
        new Date(e.target.value).getTime() +
          (dates.length - 1) * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .slice(0, 10);
      setEndDate(newEndDate);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(() => {
      const newEndDate = e.target.value;
      return newEndDate;
    });
    calculateDates();
  };

  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTime(e.target.value);
  };

  const handleAddTime = (dateBeingEdited: IDate) => {
    const newDates = [...dates];
    const changedDate = newDates.find((d) => d.id === dateBeingEdited.id);

    if (changedDate && changedDate.hours.length > 0) {
      const hourToNumber = (hour: string) => {
        return Number(hour.replace(":", ""));
      };

      const lastHourToNumber = hourToNumber(
        changedDate.hours[changedDate.hours.length - 1].hour
      );
      const newHourToNumber = hourToNumber(newTime);

      if (newHourToNumber > lastHourToNumber) {
        changedDate.hours.push({ hour: newTime });
      }
    } else if (changedDate) {
      changedDate.hours.push({ hour: newTime });
    }

    setDates(newDates);
  };

  const handleRemoveTime = (dateBeingEdited: IDate, index: number) => {
    const newTimes = [...dateBeingEdited.hours];

    newTimes.splice(index, 1);
    const newDates = [...dates];
    const changedDate = newDates.find((d) => d.id === dateBeingEdited.id);
    if (changedDate) {
      changedDate.hours = newTimes;
    }
    setDates(newDates);
  };

  useEffect(() => {
    calculateDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const calculateDates = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
    );

    const datesArray: IDate[] = [];
    for (let i = 0; i < totalDays + 1; i++) {
      let dateObj = { id: i + 1, date: "", hours: [] };
      dateObj.date = getDayAfterDate(i);
      datesArray.push(dateObj);
    }

    if (dates.length > 0) {
      const oldHours = dates[0].hours;
      datesArray[0].hours = oldHours;
    }

    setDates(datesArray);
  };

  const currentDate = new Date().toISOString().slice(0, 10);

  const handleReset = () => {
    const datesWithoutTimes: IDate[] = dates.map((date) => ({
      ...date,
      hours: [],
    }));
    setDates(datesWithoutTimes);
    setIsAutocompleteClicked(false);
  };

  const determineNewHours = (
    date: IDate,
    firstHours: IHour[],
    secondHours: IHour[]
  ) => {
    let newHours: IHour[] = [];

    if (firstHours.length > 0 && secondHours.length === 0) {
      newHours = [...firstHours];
    } else if (firstHours.length === 0 && secondHours.length > 0) {
      newHours = [...date.hours];
    } else if (firstHours.length > 0 && secondHours.length > 0) {
      newHours = date.id % 2 === 0 ? [...secondHours] : [...firstHours];
    } else {
      newHours = [...date.hours];
    }

    return newHours;
  };

  const handleAutoComplete = () => {
    setIsAutocompleteClicked(true);

    const firstHours = dates[0].hours;
    const secondHours = dates[1].hours;

    const updatedDates = dates.map((date) => {
      const newHours = determineNewHours(date, firstHours, secondHours);
      return {
        ...date,
        hours: newHours,
      };
    });

    setDates(updatedDates);
  };

  const isAutoCompleteDisabled =
    isAutocompleteClicked || dates[0]?.hours.length === 0 || dates.length === 0;

  const getPreviewDates = () => {
    if (!isAutocompleteHovered) return dates;

    const firstHours = dates[0].hours;
    const secondHours = dates[1].hours;

    return dates.map((date) => {
      const newHours = determineNewHours(date, firstHours, secondHours);
      return {
        ...date,
        hours: newHours,
      };
    });
  };

  const previewDates = getPreviewDates();

  const handleNextClick = () => {
    if (clickCounter < maxCount) {
      scrollToElement(clickCounter * 7);
      setClickCounter(clickCounter + 1);
    } else if (clickCounter === maxCount) {
      scrollToElement(dates.length - 7);
    }
  };
  const handlePrevClick = () => {
    if (clickCounter > 1) {
      scrollToElement((clickCounter - 1) * 7);
      setClickCounter(clickCounter - 1);
    } else {
      scrollToElement(0);
    }
  };

  return (
    <>
      <div className="controllers">
        <div className="datesController">
          <div>
            <p>Start-Date</p>
            <input
              className="datePicker"
              type="date"
              id="start"
              name="start"
              value={startDate}
              min={currentDate}
              max={endDate}
              placeholder="dd.mm.yyyy"
              onChange={(e) => handleStartDateChange(e)}
            />
          </div>
          <div>
            <p>End-Date</p>
            <input
              className="datePicker"
              type="date"
              id="start"
              name="end"
              value={endDate}
              min={currentDate}
              disabled={!startDate}
              placeholder="dd.mm.yyyy"
              onChange={(e) => handleEndDateChange(e)}
            />
          </div>
          {dates ? <div className="daysCount">{dates.length} days</div> : null}
        </div>
        <div className="btns">
          <button
            onClick={() => {
              handlePrevClick();
            }}
            disabled={dates.length <= 7}
            className={dates.length <= 7 ? "disabled" : ""}
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          <button
            onClick={() => {
              handleNextClick();
            }}
            disabled={dates.length <= 7}
            className={dates.length <= 7 ? "disabled" : ""}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <div className="scheduleContainer" ref={containerRef}>
        <ul className="schedule">
          {previewDates.length > 0 ? (
            previewDates.map((item, index) => (
              <li
                key={item.date}
                className="dayContainer"
                ref={handleRef(index)}
              >
                <Day
                  date={item}
                  handleAddTime={handleAddTime}
                  handleRemoveTime={handleRemoveTime}
                  newTime={newTime}
                  onTimeChange={onTimeChange}
                />
              </li>
            ))
          ) : (
            <p>Please select start and end date</p>
          )}
        </ul>
      </div>
      <div className="footer">
        <button
          onClick={() => {
            handleReset();
          }}
          className={noneDatesHaveHours ? "disabled" : ""}
          disabled={noneDatesHaveHours}
        >
          Reset
        </button>
        <button
          className={isAutoCompleteDisabled ? "disabled" : ""}
          disabled={isAutoCompleteDisabled}
          onClick={() => {
            handleAutoComplete();
          }}
          onMouseEnter={() => setIsAutocompleteHovered(true)}
          onMouseLeave={() => setIsAutocompleteHovered(false)}
        >
          Autocomplete
        </button>
        <button
          onClick={() => {
            handleUpload();
          }}
          className={!allDatesHaveHours ? "disabled" : ""}
          disabled={!allDatesHaveHours}
        >
          Upload
        </button>
      </div>
    </>
  );
}
