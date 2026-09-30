import app from './app.js';

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Code Collaborative Review API is running on http://localhost:${PORT}`
    );

});