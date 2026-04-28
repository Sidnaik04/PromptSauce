def load_prompt(path: str)->str:
    with open(path, 'r') as file:
        return file.read()
    
    