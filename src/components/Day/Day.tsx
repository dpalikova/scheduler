import "./Day.css";
import IDate from "../../types/IDate";
import { useState } from "react";

export default function Day({
  date,
  handleAddTime,
  handleRemoveTime,
  newTime,
  onTimeChange,
}: {
  date: IDate;
  handleAddTime: (dateBeingEdited: IDate) => void;
  handleRemoveTime: (dateBeingEdited: IDate, index: number) => void;
  newTime: string;
  onTimeChange: (e: any) => void;
}) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfTheWeek = days[new Date(date.date).getDay()];

  const [isTimeInputVisible, setIsTimeInputVisible] = useState(false);

  return (
    <div className="day">
      <p>{dayOfTheWeek}</p>
      <p>{date.date}</p>
      <div className="timesContainer">
        <ul>
          {date.hours?.length > 0
            ? date.hours.map((time, index) => {
                return (
                  <li key={time.hour}>
                    <div className="time">
                      <span>{time.hour}</span>
                      <button
                        className="removeTime"
                        onClick={() => handleRemoveTime(date, index)}
                      >
                        x
                      </button>
                    </div>
                  </li>
                );
              })
            : null}
        </ul>

        {date.hours?.length < 4 && !isTimeInputVisible ? (
          <button
            className="addTimerBtn"
            onClick={() => {
              setIsTimeInputVisible(true);
            }}
          >
            Add Time
          </button>
        ) : null}
        {date.hours?.length < 4 && isTimeInputVisible ? (
          <>
            <input
              className="timeInput"
              type="time"
              min="09:00"
              max="18:00"
              step="3600"
              value={newTime}
              onChange={(e) => {
                onTimeChange(e);
              }}
            ></input>
            {newTime !== "" ? (
              <button
                className="submitTime"
                onClick={() => {
                  handleAddTime(date);
                  setIsTimeInputVisible(false);
                }}
              >
                submit
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
