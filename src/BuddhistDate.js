import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra); // ใช้งาน buddhistEra plugin เพื่อแปลงเป็น พ.ศ.

/* 7 กุมภาพันธ์ 2566 */
export const DateLongTH = (date) => {
  dayjs.locale("th");
  return dayjs(date).format("D MMMM BBBB");
};

/* 7 ก.พ. 2566 */
export const DateShortTH = (date) => {
  dayjs.locale("th");
  return dayjs(date).format("D MMM BB");
};

export const DateTH = (date) => {
  dayjs.locale("th");
  return dayjs(date).format("D-MM-BB");
};

/* 7 February 2023 */
export const DateLongEN = (date) => {
  dayjs.locale("en");
  return dayjs(date).format("D MMMM YYYY");
};

/* 7 Feb 23 */
export const DateShortEN = (date) => {
  dayjs.locale("en");
  return dayjs(date).format("D MMM YY");
};

export const DateEN = (date) => {
  dayjs.locale("en");
  return dayjs(date).format("MM-DD-YY");
};
