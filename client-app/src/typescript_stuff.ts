let var1: any = 1;
var1 = '1';

let var2: number|string = 2;
var1 = '2';





export interface IDuck {
    name: string;
    numLegs: number;
    makeSound?: (sound: string) => void; // with '?' is optional
}

const duck1: IDuck = {
    name: "pedro",
    numLegs: 2,
    makeSound: (sound: any) => console.log(sound)
}

const duck2: IDuck = {
    name: "pablo",
    numLegs: 2,
    makeSound: (sound: any) => console.log(sound)
}

// duck1.makeSound!('quack'); // with '!' dissables check for optional parameter on interface

export const ducks = [duck1, duck2];