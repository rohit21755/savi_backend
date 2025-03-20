import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';




const getAuthorization = async () => {
    try{
        const url = process.env.PHONEPE_AUTHTOKEN_URL_UAT;
        if (!url) {
            throw new Error("PHONEPE_AUTHTOKEN_URL_UAT is not defined");
        }
        console.log(url)
        const data = new URLSearchParams({
            client_id: process.env.CLIENT_ID || '',
            client_version:  '1',
            client_secret: process.env.CLIENT_SECRET || '',
            grant_type: 'client_credentials'
        }).toString()
        console.log(data)
        const response = await axios.post("https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",data, {
            headers: {
                "Content-Type" : "application/x-www-form-urlencoded"
            }
        });
        console.log("response", response.data)
    }
    catch(error){
        console.log("error in getAuthorization", error)
    }
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    await getAuthorization()

    res.send("hello")
    // const {name, mobileNumber, amount} = req.body;
    // const orderId = uuidv4() 

    // // const paymentPayload = {
    // //     merchantId : MERCHANT_ID,
    // //     merchantUserId: name,
    // //     mobileNumber: mobileNumber,
    // //     amount : 2 * 100,
    // //     merchantTransactionId: orderId,
    // //     redirectUrl: `${redirectUrl}/?id=${orderId}`,
    // //     redirectMode: 'POST',
    // //     paymentInstrument: {
    // //         type: 'PAY_PAGE'
    // //     }
    // // }

    // const paymentPayloadUat = {
    //     "merchantId": "PGTESTPAYUAT",
    //     "merchantTransactionId": "MT7850590068188104",
    //     "merchantUserId": "MUID123",
    //     "amount": 10000,
    //     "redirectUrl": "https://webhook.site/redirect-url",
    //     "redirectMode": "REDIRECT",
    //     "callbackUrl": "https://webhook.site/callback-url",
    //     "mobileNumber": "9999999999",
    //     "paymentInstrument": {
    //       "type": "PAY_PAGE"
    //     }
    // }
    // console.log("done payment payload")
    // const payload = Buffer.from(JSON.stringify(paymentPayloadUat)).toString('base64')
    // const keyIndex = 1
    // const string = payload + '/pg/v1/pay' + MERCHANT_KEY
    // const sha256 = crypto.createHash('sha256').update(string).digest('hex')
    // const checksum = sha256 + '###' + 1
    // console.log("done here:", checksum)
    // const option = {
    //     method: 'POST',
    //     url:"https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
    //     headers: {
    //         accept : 'application/json',
    //         'Content-Type': 'application/json',
    //         'X-VERIFY': checksum
    //     },
    //     data :{
    //         request : payload
    //     }
    // }
    // console.log("done here try")
    // try {
        
    //     const response = await axios.request(option);
    //      res.status(200).json({msg : "OK", url: response.data.data.instrumentResponse.redirectInfo.url})
    // } catch (error) {
    //     console.log("error in payment", error)
    //     res.status(500).json({error : 'Failed to initiate payment'})
    // }
}