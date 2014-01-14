//
//  Response.h
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 12/3/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface Response : NSObject

@property int erreur;
@property NSString *ip;
@property NSString *etat;
@property NSString* json;

//init
-(id)initWithJson:(NSDictionary*)receivedJson;
//method
-(NSString*)description;

@end
