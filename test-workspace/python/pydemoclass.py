class PyDemoClass:
    MY_STATIC_VAR = 10

    def __init__(self, a, b):
        self.a = a
        self.b = b

    def hello(self):
        print(f'Hello {self.message}')

    @property
    def message(self):
        return 'world'

    @classmethod
    def my_class_method(cls):
        pass
