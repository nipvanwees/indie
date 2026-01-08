
// in a format fot the input with type datetime-local
const toLocalDateTime = (date: Date, includeTime: boolean) => {
    console.log(date)
    const localDate = new Date(date.getTime());
    console.log(localDate)
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    console.log(year, month, day, hours, minutes)
    
    return includeTime
        ? `${year}-${month}-${day}T${hours}:${minutes}`
        : `${year}-${month}-${day}`;
    }

export default toLocalDateTime;

  