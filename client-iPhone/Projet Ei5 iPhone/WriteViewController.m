//
//  WriteViewController.m
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 12/3/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import "WriteViewController.h"
#import "ResponseViewController.h"
#import "Arduino.h"
#import "Response.h"

@interface WriteViewController ()

@end

@implementation WriteViewController

@synthesize pinNumberTextField, valueTextField, modeSegmentedControl, tableView, arduinos;

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
    NSCharacterSet *numericOnly = [NSCharacterSet decimalDigitCharacterSet];
    
    if(!pinNumberTextField.text.length || ![numericOnly isSupersetOfSet:[NSCharacterSet characterSetWithCharactersInString:pinNumberTextField.text]] || [pinNumberTextField.text intValue] < 0 || [pinNumberTextField.text intValue] > 15 ) errorMessage = @"Pin number must be between 0 and 15";
    else if(!valueTextField.text.length || ![numericOnly isSupersetOfSet:[NSCharacterSet characterSetWithCharactersInString:valueTextField.text]] || [valueTextField.text intValue] < 0) errorMessage = @"Value must be superior to 0";
    else if(indexPath == nil) errorMessage = @"You haven't selected an arduino board !";
    
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
        NSString *mode;
        if(modeSegmentedControl.selectedSegmentIndex == 1) mode = @"a";
        else mode = @"b";
        NSString *command = [NSString stringWithFormat:@"%@/arduinos/pinWrite/%@/%@/%@/%@/%@", globalServerAddress, arduino.ip, arduino.ip,pinNumberTextField.text,mode,valueTextField.text];
        
        ///rest/arduinos/pinWrite/:idCommand/:idArduino/:pin/:mode/:val
        NSURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:command]];
        NSOperationQueue *queue = [[NSOperationQueue alloc] init];
        [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
         {
             if([data length] > 0 && error == nil) {
                 NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
                 Response *response = [[Response alloc]initWithJson:[json valueForKey:@"data"]];
                 NSLog(@"response received: %@", response);
                 [self performSelectorOnMainThread:@selector(showResponse:) withObject:response waitUntilDone:YES];
                 
             }
             else NSLog(@"error request arduino list");
         }];
        
    }
    
}

-(void)showResponse:(Response*)response {
    [self performSegueWithIdentifier:@"writeToResponse" sender:response];
}

//change views
-(void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    //go to chapters' view
    if([segue.identifier isEqualToString:@"writeToResponse"]) {
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