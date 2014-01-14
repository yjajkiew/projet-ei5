//
//  CommandViewController.m
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 12/10/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import "CommandViewController.h"
#import "ResponseViewController.h"
#import "Arduino.h"
#import "Response.h"

@interface CommandViewController ()

@end

@implementation CommandViewController

@synthesize commandTextView, tableView, arduinos;

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
	// Do any additional setup after loading the view.
    arduinos = [[NSMutableArray alloc] init];
    tableView.delegate = self;
    tableView.dataSource = self;
    
    [commandTextView.layer setBorderColor: [[UIColor darkGrayColor] CGColor]];
    [commandTextView.layer setBorderWidth: 1.0];
    [commandTextView.layer setCornerRadius:8.0f];
    
    [self fetchArduinosList];
}

-(void)fetchArduinosList {
    NSURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@/arduinos/", globalServerAddress]]];
    NSOperationQueue *queue = [[NSOperationQueue alloc] init];
    [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
     {
         if([data length] >0 && error == nil) {
             NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
             
             [self performSelectorOnMainThread:@selector(updateUIWithDictionary:) withObject:json waitUntilDone:YES];
             
         }
         else NSLog(@"error request arduino list");
     }];
}

-(void)updateUIWithDictionary:(NSDictionary *)json {
    NSArray *arrayArduinosJson = [json valueForKey:@"data"];
    for(NSDictionary *json in arrayArduinosJson) {
        Arduino *arduino = [[Arduino alloc] initWithJson:json];
        if (arduino != nil) [arduinos addObject:arduino];
        arduino = nil;
    }
    [tableView reloadData];
}

//define number of sections
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 1;
}

//define number of rows for each section
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if(section == 0) return arduinos.count;
    else return 0;
}

-(NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if(section == 0) return @"Select arduino";
    else return nil;
}

//change color of header titles
- (void)tableView:(UITableView *)tableView willDisplayHeaderView:(UIView *)view forSection:(NSInteger)section
{
    // Text Color
    UITableViewHeaderFooterView *header = (UITableViewHeaderFooterView *)view;
    [header.textLabel setTextColor:[UIColor whiteColor]];
}

- (UITableViewCell *) tableView:(UITableView *)table cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *cellIdentifier = @"cell";
    
    UITableViewCell *cell = [table dequeueReusableCellWithIdentifier:cellIdentifier];
    if (cell == nil) cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellIdentifier];
    
    cell.backgroundColor = [UIColor darkGrayColor];
    cell.textLabel.textColor = [UIColor lightGrayColor];
    
    //change color when cell selected
    UIView *selectionColor = [[UIView alloc] init];
    selectionColor.backgroundColor = UIColorFromRGB(0x067AB5);
    cell.selectedBackgroundView = selectionColor;
    
    //arduinos
    if(indexPath.section == 0) {
        cell.textLabel.text = ((Arduino*)[arduinos objectAtIndex:indexPath.row]).desc;
    }
    
    return cell;
}

//Action when a cell is selected
- (void) tableView:(UITableView *)table didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    NSLog(@"%@", [NSString stringWithFormat:@"Cell %ld in Section %ld is selected",(long)indexPath.row, (long)indexPath.section]);
    if ([table isEqual:tableView] && indexPath.section == 0) {
        
    }
}


- (IBAction)sendButton:(id)sender {
    NSString *errorMessage = nil;
    NSIndexPath *indexPath = tableView.indexPathForSelectedRow;
    
    NSData *commandJsonData = [commandTextView.text dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *commandJson = [NSJSONSerialization JSONObjectWithData:commandJsonData options:NSJSONReadingAllowFragments error:nil];
    
    if(indexPath == nil) errorMessage = @"You haven't selected an arduino board !";
    else if(!commandTextView.text.length) errorMessage = @"Command must be written";
    else if([commandJson valueForKey:@"id"] == [NSNull null] || [commandJson valueForKey:@"pa"] == [NSNull null] || [commandJson valueForKey:@"ac"] == [NSNull null]) errorMessage = @"Incorrect Json command";
    
    //error => display alert
    if(errorMessage != nil) {
        UIAlertView *errorAlert = [[UIAlertView alloc] initWithTitle:@"Error"
                                                             message:errorMessage
                                                            delegate:nil
                                                   cancelButtonTitle:@"OK"
                                                   otherButtonTitles:nil];
        [errorAlert show];
    }
    else {
        NSLog(@"%@", [NSString stringWithFormat:@"Button: Cell %ld in Section %ld is selected",(long)indexPath.row, (long)indexPath.section]);
        Arduino *arduino = [arduinos objectAtIndex:indexPath.row];
        
        //create post data
        NSData *postData = [commandTextView.text dataUsingEncoding:NSASCIIStringEncoding allowLossyConversion:YES];
        NSString *postLength = [NSString stringWithFormat:@"%d", [postData length]];

        //create request with postdata
        NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
        [request setURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@/arduinos/commands/%@", globalServerAddress, arduino.ip]]];
        [request setHTTPMethod:@"POST"];
        [request setValue:postLength forHTTPHeaderField:@"Content-Length"];
        [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
        [request setHTTPBody:postData];
        
        //send request and process result
        NSOperationQueue *queue = [[NSOperationQueue alloc] init];
        [NSURLConnection sendAsynchronousRequest:request queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
         {
             if([data length] > 0 && error == nil) {
                 NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
                 NSArray *result = [json valueForKey:@"data"];
                 Response *response = [[Response alloc]initWithJson:[result firstObject]];
                 NSLog(@"response received: %@", response);
                 [self performSelectorOnMainThread:@selector(showResponse:) withObject:response waitUntilDone:YES];
             }
             else NSLog(@"error request arduino list");
         }];
        
    }
    
}

-(void)showResponse:(Response*)response {
    [self performSegueWithIdentifier:@"commandToResponse" sender:response];
}

//change views
-(void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    //go to chapters' view
    if([segue.identifier isEqualToString:@"commandToResponse"]) {
        ResponseViewController *responseVC = segue.destinationViewController;
        responseVC.response = (Response*)sender;
    }
}

//hide keyboard when user touches the screen outside of textfields
- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
    
    UITouch *touch = [[event allTouches] anyObject];
    
    if (![[touch view] isKindOfClass:[UITextField class]]) {
        [self.view endEditing:YES];
    }
    [super touchesBegan:touches withEvent:event];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
