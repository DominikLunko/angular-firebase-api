import jwt, { decode } from 'jsonwebtoken';

const auth = async (req, res, next) => {
    try {
        /*
        -- STARI NAČIN ---
        const token = req.headers.authorization.split(" ")[1];
        let decodedData;
        if(token){
            decodedData = jwt.verify(token, 'test');
            //console.log(token);
            //console.log(decodedData);


            req.userId = decodedData?.id;
        }
        */
       // -- NOVI NAČIN --
        const cookie = req.cookies['jwt'];

        if (cookie) {
            const claims = jwt.verify(cookie, 'test');
            req.userId = claims._id;
            next();
        } else {
            res.status(200).send({
                success: false,
                message: 'Unauthorized!'
            })
        }
    } catch (error) {
        console.log(error);
    }
}

export default auth;