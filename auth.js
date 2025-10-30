const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const ensureAuth = (req, res)=>{
    try {
        let receivedJwt= req.headers["authorization"];
        console.log("received jwt: ", receivedJwt);

        if(receivedJwt){
            let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
            console.log(decodedJwt);
            return decodedJwt;
        }else{
            // return receivedJwt; // undefined
            throw new ReferenceError("jwt must be provided");
        }

        
    } catch (err) {
        console.log(err.name);
        console.log(err.message);

        return err;
    }
};

module.exports = ensureAuth;