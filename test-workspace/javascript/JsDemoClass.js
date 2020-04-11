class JsDemoClass {
  static MY_STATIC_VAR = 10;

  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  hello(self) {
    console.log(`Hello ${this.message}`);
  }

  get message() {
    return 'world';
  }
}
