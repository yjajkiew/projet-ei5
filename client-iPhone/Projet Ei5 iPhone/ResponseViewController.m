//
//  ResponseViewController.m
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 12/3/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import "ResponseViewController.h"

@interface ResponseViewController ()

@end

@implementation ResponseViewController

@synthesize response, erreurLabel, etatLabel, idLabel, jsonTextView;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	
    //init view title in navigation bar
    [self.navigationItem setTitle:NSLocalizedString(@"response-title",nil)];
    
    erreurLabel.text = [NSString stringWithFormat:@"%d",response.erreur];
    etatLabel.text = response.etat;
    idLabel.text = response.ip;
    jsonTextView.text = response.json;
    
    [jsonTextView.layer setBorderColor: [[UIColor darkGrayColor] CGColor]];
    [jsonTextView.layer setBorderWidth: 1.0];
    [jsonTextView.layer setCornerRadius:8.0f];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
