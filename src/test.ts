type Option<T> = { [P in keyof T]: T[P] extends object ? Option<T[P]> : (T[P] | null) };

interface ITest {
    a: number;
    dupa(): void;
}

interface IUser {
    name: string;
    username: string;
    other: number;
    test: ITest;
}

function getUser(): IUser {}

function getUserMaybe(): Option<IUser> {}

const user = getUser();
user.name.split('');
user.test.a.toExponential()

const userOption = getUserMaybe();
userOption.name.split('');
const num = userOption.test.a;
