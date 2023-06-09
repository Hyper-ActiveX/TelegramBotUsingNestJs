import { Injectable, Logger } from '@nestjs/common';
const TelegramBot = require('node-telegram-bot-api');

const axios = require("axios");

const express = require('express');

// import {admin_user_id} from "./telegram.constant";

const token = '6097221197:AAFJOE2hyqrrhKxTMv_VfaS38eTucna9q2k';
const subscribers = new Set();
const admins = new Set();
const blockset= new Set();

admins.add(1300761067);
let flag:boolean = false;

@Injectable()
export class TelegramService {
    private readonly bot: any
    //instead of this code we can use console log
    private logger = new Logger(TelegramService.name);


    constructor() {
        this.bot = new TelegramBot(token, { polling: true });

        // revieve message
        // this.bot.on("message",this.onrecieveMessage);
        



        this.bot.on("message", async (msg) => {
            const chatId = msg.chat.id;
            const userInput = msg.text;

            // this.logger.debug(msg.message);
            // console.log(msg, msg.text);

            async function subscribersfun(susbcribed_users,bot) {
                if (subscribers.has(susbcribed_users)) {
                    await bot.sendMessage(chatId, "You already subscribed");
                }
                else {
                    await subscribers.add(susbcribed_users);
                    await bot.sendMessage(chatId, "successfully Subscribed");
                }
            }
            async function unsubscribefun(susbcribed_users,bot) {
                if (subscribers.has(susbcribed_users)) {
                     subscribers.delete(susbcribed_users);
                    await bot.sendMessage(chatId, "Unsubscribed Successfully");
                }
                else {
                    await bot.sendMessage(chatId, "you are not a subscriber member");
                }
            }

            async function addAdmin(adminId,username ,bot){
                if(admins.has(adminId)){
                    await bot.sendMessage(chatId, username + " is already and admin");
                }
                else{
                     admins.add(adminId);
                    await bot.sendMessage(chatId, username + " is now admin");
                }
            }

            async function blockUser(chatId,username, bot){
                if(admins.has(chatId)){
                    blockset.add(username);
                    await bot.sendMessage(chatId, username + " added to blocklist");
                }
                else{
                    bot.sendMessage(chatId, "You are not admin you can't perform this task");
                }
            }

            const commonmsg = "for weather update you have to write city name";

            const helpertext = 'For weather update you have to write city name' + '\n' + 'For subscribe weatherapp please write /subscribe'
                + '\n' + 'for unsubscribe please write /unsubscribe';

            if(admins.has(chatId) && msg.text ==="/block"){
                this.bot.sendMessage(chatId,"please write user_name whom you want to block");

                // await blockUser(chatId,msg.text,this.bot)
                // msg.text.split("/");
                // // usename = msg.text.split("/")[2]
                // console.log(msg.text.split("/")[2]);
                flag=true;

            }
            else if(flag===true){
                await blockUser(chatId, msg.text, this.bot);
                flag = false;
            }
            else if (userInput === '/start') {
                await this.bot.sendMessage(chatId, "You started");
                await this.bot.sendMessage(chatId, helpertext);
            }
            else if (userInput === "/subscribe") {
                await subscribersfun(chatId,this.bot);
                await this.bot.sendMessage(chatId, helpertext);
            }
            else if (userInput === "/unsubscribe") {
                await unsubscribefun(chatId,this.bot);
                await this.bot.sendMessage(chatId, "Please subscribe to get weather update");
            }
            else if (userInput === "hello" || userInput === "hi" || userInput === "hii") {
                await this.bot.sendMessage(chatId, "🙋‍♂️ hii! " + commonmsg);
            }
            else {
                try {
                    const response = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=bd2a9f10f65489d3347ec44572847012`
                    );
                    const data = response.data;
                    const weather = data.weather[0].description;
                    const temperature = data.main.temp - 273.15;
                    const city = data.name;
                    const humidity = data.main.humidity;
                    const pressure = data.main.pressure;
                    const windSpeed = data.wind.speed;
                    const message = `The weather in ${city} is ${weather} with a temperature of ${temperature.toFixed(2)}°C. The humidity is ${humidity}%, the pressure is ${pressure}hPa, and the wind speed is ${windSpeed}m/s.`;
                    if (subscribers.has(chatId)) {
                        await this.bot.sendMessage(chatId, message);
                        await this.bot.sendMessage(chatId, helpertext);
                    }
                    else {
                        await this.bot.sendMessage(chatId, "subscribe to get weather update");
                        await this.bot.sendMessage(chatId, helpertext);
                    }

                    // console.log(chatId,'\n',message);
                    // console.log(data,'\n',weather,'\n',temperature,'\n',city,'\n',humidity,'\n',pressure,'\n',windSpeed,'\n');
                } catch (error) {
                    this.bot.sendMessage(chatId, "I didn't get,Firstly write me /subscribe then write a valid city name");
                }
            }
            if(admins.has(chatId)){
                this.bot.sendMessage(chatId, "You can perform /block operation because you are admin❤️")
            }
            

        });
    }

    onrecieveMessage = (msg: any) => {
        this.logger.debug(msg);
    }
}
