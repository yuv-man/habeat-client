export const calculateBMR = (userData: any) => {
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height);
    const age = parseFloat(userData.age);
  
    if (userData.gender === "male") {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };
  
  export const calculateTDEE = (bmr: number) => {
    // Using moderate activity level (1.55) as default
    return bmr * 1.55;
  };
  
  export const calculateIdealWeight = (userData: any) => {
    const height = parseFloat(userData.height);
    // Using Devine formula
    if (userData.gender === "male") {
      return 50 + 2.3 * ((height - 152.4) / 2.54);
    } else {
      return 45.5 + 2.3 * ((height - 152.4) / 2.54);
    }
  };