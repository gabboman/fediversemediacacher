import express, { Express, Request, Response } from 'express';
import cors from 'cors'
const fs = require('fs')
const { http, https } = require('follow-redirects');

const environment = require('./environment')
const crypto = require('crypto');

const app = express()
const PORT = environment.port
const validExtensions = environment.validFormats

app.use(cors())


app.get('/', async (req: Request, res: Response) =>{
        if(req.query && req.query.media) {
            const mediaLink: string = req.query.media as string
            const mediaLinkArray = mediaLink.split('.')
            let linkExtension = mediaLinkArray[mediaLinkArray.length -1].toLowerCase()
            // calckey images have no extension
                if(validExtensions.indexOf(linkExtension) == -1 ){
                    linkExtension = ''
                }
                const mediaLinkHash = crypto.createHash('sha256').update(mediaLink).digest('hex')
                const localFileName = linkExtension ? `cache/${mediaLinkHash}.${linkExtension}`: `cache/${mediaLinkHash}`
                if (fs.existsSync(localFileName)) {
                    // We have the image! we just serve it
                    res.sendFile(localFileName, { root: '.' })
                  } else {
                    // its downloading time!
                    try {
                        https.get(mediaLink,(httpResponse: any) => {
                            // Image will be stored at this path
                            if(httpResponse.statusCode == 200) {
                            const path = `${__dirname}/${localFileName}`;
                            const filePath = fs.createWriteStream(path);
                            httpResponse.pipe(filePath);
                            filePath.on('finish',() => {
                            filePath.close();
                            res.sendFile(localFileName, { root: '.' })
                        })
                            } else {
                                res.sendStatus(404)
                            }
                        })
                    } catch (error) {
                        res.sendStatus(404)
                    }
                    
                  }






        } else {
            res.sendStatus(404)
        }
    }
)

app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡️Server is running at https://localhost:${PORT}`)
  })
