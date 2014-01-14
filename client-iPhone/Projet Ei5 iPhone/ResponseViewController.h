//
//  ResponseViewController.h
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 12/3/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "Response.h"

@interface ResponseViewController : UIViewController

@property Response *response;

@property (weak, nonatomic) IBOutlet UILabel *erreurLabel;
@property (weak, nonatomic) IBOutlet UILabel *etatLabel;
@property (weak, nonatomic) IBOutlet UILabel *idLabel;
@property (weak, nonatomic) IBOutlet UITextView *jsonTextView;

@end
