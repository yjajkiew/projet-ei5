//
//  Arduino.m
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 11/29/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import "Arduino.h"

@implementation Arduino

@synthesize ip, desc, mac, port;

-(id)initWithJson:(NSDictionary*)json {
    
    ip = [json valueForKey:@"id"];
    desc = [json valueForKey:@"description"];
    mac = [json valueForKey:@"mac"];
    port = [[json valueForKey:@"port"] intValue];
    
    return self;
}

-(NSString*)description {
    return [NSString stringWithFormat:@"ip:%@ - desc: %@ - mac: %@ - port: %d", ip, desc, mac, port];
}

@end
