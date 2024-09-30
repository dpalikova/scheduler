import IHour from "./IHour";

export default interface IDate {
  id: number;
  date: string;
  hours: IHour[];
}
