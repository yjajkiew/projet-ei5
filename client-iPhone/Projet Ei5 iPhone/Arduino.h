//
//  Arduino.h
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 11/29/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface Arduino : NSObject

@property NSString *ip;
@property NSString *desc;
@property NSString *mac;
@property int port;

//init
-(id)initWithJson:(NSDictionary*)json;
//method
-(NSString*)description;

@end
